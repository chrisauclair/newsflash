// load dependencies
var _ = require('lodash');
var striptags = require('striptags');
var similarity = require('compute-cosine-similarity');
var clusterfck = require('clusterfck');
var all = require('node-promise').all;
var Tokenizer = require('sentence-tokenizer');
var Utils = require('./utils/utils');
var Tfidf = require('./helpers/tfidf');
var Article = require('./model/articles');
var Cluster = require('./model/clusters');
var articleHelpers = require('./helpers/article');

module.exports = (function() {
    var Aggregator = function() {

        // global object members
        var keywordTotal = 4;
        var articleDocs;

        var processDocs = function() {

            // collect article content to parse for keywords
            var collection = articleDocs.map(function(item) {

                // combine title and content for keyword search
                return item.title + " " + striptags(item.content);
            });

            // get keywords for each collection item
            var collectionKeywords = [];
            for (var i = 0, n = collection.length; i < n; i++) {
                collectionKeywords.push(getKeywords(collection[i], collection));
            }

            // flatten keywords, keep only unique items, and set to lowercase
            collectionKeywords = _.uniq(_.flattenDeep(collectionKeywords).map(function(item) {
                return item.toLowerCase();
            }));

            // get article summaries
            getArticleSummaries(collectionKeywords);

            /*
             * Iterate over each article, then each keyword
             * Identify which keywords in a document are relevant across the whole collection
             * Algorithm employed to weight keywords is term frequency--inverse document frequency
             */
            keywordVectors = [];
            for (var i = 0, n = collection.length; i < n; i++) {

                // vectors for the other axis
                var vectors = [];

                // iterate through
                var doc = collection[i];
                for (var j = 0, x = collectionKeywords.length; j < x; j++) {

                    // default value
                    var vector = 0;

                    // get TF-IDF of keyword in document
                    var keyword = collectionKeywords[j];
                    if (Tfidf.frequency(keyword, doc) > 0) {
                        vector = Tfidf.tfidf(keyword, doc, collection);
                    }

                    // add to keyword axis
                    vectors.push(vector);
                }
                // add to collection axis
                keywordVectors.push(vectors);
            }

            // get a grid of the cosine similarity of keyword vector grid
            var similarityVectors = getCollectionSimilarity(keywordVectors);

            // identify clusters through hierarchical clustering
            // TODO: find a better ideal threshold
            var similarityThreshold = 1.2;
            var clusters = clusterfck.hcluster(similarityVectors, 'euclidean', 'average', similarityThreshold);

            // save clusters (and their article ids) to database
            saveClusters(clusters, similarityVectors).then(function(res) {
                cleanClusters();
            }, function(err) {
                console.log("cluster save error: ", err);
            });

        };

        var cleanClusters = function() {
            // TODO: logic for removing stale clusters
        };

        var saveClusters = function(clusters, similarityVectors) {
            var promises = Utils.createPromises(clusters.length);
            for (var i = 0; i < clusters.length; i++) {
                var promise = promises[i];

                // if cluster is bigger than 1, save to database
                if(clusters[i].size > 1) {
                    saveCluster(clusters[i], similarityVectors, promise);
                } else {
                    promise.resolve();
                }
            }

            return all(promises);
        };

        var saveCluster = function(cluster, similarityVectors, promise) {
            console.log("CLUSTER:");

            // get index of article doc by similarity vectors
            var indexes = [];
            indexes = recurseCluster(cluster, similarityVectors, indexes);

            // save cluster to database
            var clusterModel = new Cluster();
            var articlePromises = Utils.createPromises(indexes.length);

            // get article doc from index
            for (i = 0; i < indexes.length; i++) {
                var doc = articleDocs[indexes[i]];
                var articlePromise = articlePromises[i];

                // add article to cluster model
                clusterModel.articles.push(doc);

                // add cluster_id to article
                doc.cluster_id = clusterModel;

                // update article
                articleHelpers.updateArticle(doc, articlePromise);

                // print to console
                console.log("  " + doc.title);
            }

            // once articles are update, create new clusters
            all(articlePromises).then(function(res) {
                clusterModel.save(function(err) {
                    if (err) console.log(err);

                    promise.resolve(res);
                });
            }, function(err) {
                promise.reject(err);
            });
        };

        // recursively get article index for each node in cluster
        var recurseCluster = function(cluster, vectors, indexes) {

            // iterate through node properties
            for (var prop in cluster) {
                if (cluster.hasOwnProperty(prop)) {
                    if (prop === "value") {
                        indexes.push(vectors.indexOf(cluster[prop]));
                    } else if (prop === "left" || prop === "right") {
                        indexes = recurseCluster(cluster[prop], vectors, indexes);
                    }
                }
            }

            return indexes;
        };

        // get article summaries
        var getArticleSummaries = function(keywords) {
            var tokenizer = new Tokenizer();

            // TODO: add common abbreviations to database
            var abbreviations = [
                "I.O.U.",
                "M.D.",
                "N.B.",
                "P.O.",
                "U.K.",
                "U.S.",
                "U.S.A.",
                "P.S.",
                "Mr.",
                "Ms.",
                "Mrs.",
                "Dr.",
                "Jr.",
                "Lt.",
                "Gen.",
                "Sgt.",
                "Cpl.",
                "Pvt.",
                "Brig.",
                "Col.",
                "Maj.",
                "Jan.",
                "Feb.",
                "Mar.",
                "Apr.",
                "Aug.",
                "Sept.",
                "Oct.",
                "Nov.",
                "Dec."
            ];

            articleDocs.forEach(function(doc, i, docs) {

                var content = striptags(doc.content);
                var summary = "";
                if (content) {
                    // create ranked array of sentences
                    var ranked = [];
                    var rankedMax = 4;
                    var rankedHighest = 0;
                    var rankedStart = 0;

                    // tokenize sentences
                    tokenizer.setEntry(content);
                    var tokens = tokenizer.getSentences();

                    // iterate through each token to fix abbreviations and rank
                    var length = tokens.length;
                    tokens.forEach(function(token, i, tokens) {
                        var rank = 0;

                        // split token into basic words and check for abbreviations
                        var words = token.split(" ");
                        if (abbreviations.indexOf(words[words.length - 1]) !== -1) {
                            if (i < (length - 1)) {

                                // move content to next token
                                tokens[i + 1] = tokens[i] + " " + tokens[i + 1];
                                tokens[i] = "";
                                token = "";
                            }
                        }

                        // rank for each keyword across all documents
                        keywords.forEach(function(keyword) {
                            rank += Tfidf.frequency(keyword, content);
                        });

                        // update position in array based on rank
                        // logic assumes earlier sentences are still more important
                        if (token) {
                            if (rank > rankedHighest) {
                                rankedHighest = rank;
                                ranked.splice(rankedStart, 0, token);
                                rankedStart++;
                            } else {
                                ranked.push(token);
                            }
                        }
                    });

                    // determine max length
                    if (ranked < rankedMax) {
                        rankedMax = ranked.length;
                    }

                    // keep only the top sentences
                    ranked = ranked.slice(0, rankedMax);

                    // join as a string
                    summary = ranked.join(" ... ");
                }

                // add to doc for database save
                doc.summary = summary;
            });
        }

        // determine cosine similartiy of each document in collection based on keyword vectors for each
        var getCollectionSimilarity = function(keywordVectors) {
            var length = keywordVectors.length;

            // create new n-dimensional array
            var vectors = Utils.createNDimArray([length, length]);

            // iterate through each axis of new vector grid and calculate similarity of keywords
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    vectors[i][j] = similarity(keywordVectors[i], keywordVectors[j]);
                }
            }

            return vectors;
        };

        /*
         * Identify they key words in each document based on frequency
         * Identify which words in a document are relevant across the whole collection
         * Algorithm employed to weight keywords is term frequency--inverse document frequency
         */
        var getKeywords = function(doc, collection) {
            // console.log("process article");

            // associative array of words and their frequency
            var wordHash = [];

            var words = _.uniq(Utils.splitWords(doc));
            for (var i = 0, n = words.length; i < n; i++) {
                var word = words[i];
                var tfidf = Tfidf.tfidf(word, doc, collection);
                wordHash.push({
                    word: word,
                    freq: tfidf
                });
            }

            var keywords = identifyKeywords(wordHash);

            return keywords;
        };

        // iterate over hash to pick the most frequent words
        function identifyKeywords(wordHash) {

            // sort by frequency, remove frequency, slice first items
            var keywords = wordHash.sort(function(a, b) {
                if (a.freq > b.freq) {
                    return -1;
                }
                if (a.freq < b.freq) {
                    return 1;
                }

                return 0;
            }).map(function(obj) {
                return obj.word;
            }).slice(0, keywordTotal);

            // console.log("keywords: ", keywords);

            return keywords;
        }

        // handle errors
        var handleError = function(err) {
            console.log("process article error: ", err);
        };

        // initialize article aggregator
        Aggregator.prototype.init = function() {
            console.log("aggregator init");

            Article.find().exec(function(err, docs) {
                if (err) return handleError(err);

                // set global variables
                articleDocs = docs;

                // process all docs
                processDocs();
            });
        };
    };

    return Aggregator;
})();
