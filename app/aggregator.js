// load dependencies
var _ = require('lodash');
var striptags = require('striptags');
var similarity = require('compute-cosine-similarity');
var clusterfck = require('clusterfck');
var Utils = require('./utils/utils');
var Tfidf = require('./helpers/tfidf');
var Article = require('./model/articles');
var Cluster = require('./model/clusters');
var all = require('node-promise').all;
var articleHelpers = require('./helpers/article');

module.exports = (function() {
    var Aggregator = function() {

        var keywordTotal = 4;
        var articleDocs;

        var processDocs = function() {
            var collectionKeywords = [];
            var collection = articleDocs.map(function(item) {
                return item.title + " " + striptags(item.content);
            });

            for (var i = 0, n = collection.length; i < n; i++) {
                collectionKeywords.push(getKeywords(collection[i], collection));
            }

            collectionKeywords = _.uniq(_.flattenDeep(collectionKeywords).map(function(item) {
                return item.toLowerCase();
            }));

            collectionVectors = [];
            for (var i = 0, n = collection.length; i < n; i++) {
                var vectors = [];
                var doc = collection[i];
                for (var j = 0, x = collectionKeywords.length; j < x; j++) {
                    var keyword = collectionKeywords[j];
                    var vector = 0;
                    if (Tfidf.frequency(keyword, doc) > 0) {
                        vector = Tfidf.tfidf(keyword, doc, collection);
                    }

                    vectors.push(vector);
                }
                collectionVectors.push(vectors);
            }

            var similarityVectors = getCollectionSimilarity(collectionVectors);

            var similarityThreshold = 1.2;
            var clusters = clusterfck.hcluster(similarityVectors, 'euclidean', 'average', similarityThreshold);

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
                if(clusters[i].size > 1) {
                    saveCluster(clusters[i], similarityVectors, promise);
                } else {
                    promise.resolve();
                }
            }

            return all(promises);
        };

        var saveCluster = function(cluster, similarityVectors, promise) {
            // console.log("CLUSTER ---");
            var indexes = [];
            indexes = recurseCluster(cluster, similarityVectors, indexes);

            var clusterModel = new Cluster();
            var articlePromises = Utils.createPromises(indexes.length);
            for (j = 0; j < indexes.length; j++) {
                var doc = articleDocs[indexes[j]];
                var articlePromise = articlePromises[j];
                clusterModel.articles.push(doc);
                doc.cluster_id = clusterModel;
                articleHelpers.updateArticle(doc, articlePromise);
            }

            // console.log(clusterModel.articles);

            all(articlePromises).then(function(res) {
                clusterModel.save(function(err) {
                    if (err) console.log(err);
                    promise.resolve(res);
                    console.log("cluster saved");
                });
            }, function(err) {
                promise.reject(err);
            });
        };

        var recurseCluster = function(cluster, vectors, indexes) {
            // console.log(cluster);
            for (var prop in cluster) {
                if (cluster.hasOwnProperty(prop)) {

                    // console.log(prop);
                    if (prop === "value") {
                        indexes.push(vectors.indexOf(cluster[prop]));
                        // console.log(clusters[prop]);
                    } else if (prop === "left" || prop === "right") {
                        indexes = recurseCluster(cluster[prop], vectors, indexes);
                    }
                }
            }

            return indexes;
        };



        var getCollectionSimilarity = function(collectionVectors) {
            var length = collectionVectors.length;
            var vectors = Utils.createNDimArray([length, length]);
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    vectors[i][j] = similarity(collectionVectors[i], collectionVectors[j]);
                }
            }

            return vectors;
        };

        var getKeywords = function(doc, collection) {
            console.log("process article");

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

        function identifyKeywords(wordHash) {

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

            console.log("keywords: ", keywords);

            return keywords;
        }

        var handleError = function(err) {
            console.log("process article error: ", err);
        };

        Aggregator.prototype.init = function() {
            Article.find().exec(function(err, docs) {
                if (err) return handleError(err);

                articleDocs = docs;

                processDocs();
            });
        };
    };

    return Aggregator;
})();
