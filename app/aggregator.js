// load dependencies
var _ = require('lodash');
var striptags = require('striptags');
var Utils = require('./utils/utils');
var Tfidf = require('./helpers/tfidf');
var Article = require('./model/articles');

module.exports = (function() {
    var Aggregator = function() {

        var keywordTotal = 4;
        var articleDocs;
        var collection = [];
        var collectionKeywords = [];

        var processDocs = function() {
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
                // console.log(doc);
                for (var j = 0, x = collectionKeywords.length; j < x; j++) {
                    var keyword = collectionKeywords[j];
                    var vector = 0;
                    // console.log(Tfidf.frequency(keyword, doc));
                    if (Tfidf.frequency(keyword, doc) > 0) {
                       //  console.log("yep");
                        vector = Tfidf.tfidf(keyword, doc, collection);
                    }

                    vectors.push(vector);
                }
                collectionVectors.push(vectors);
            }

            console.log(collectionVectors);
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
        }
    };

    return Aggregator;
})();
