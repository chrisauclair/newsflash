// load depedencies
var _ = require('lodash');
var Utils = require('../utils/utils');

// words to ignore
// TODO: add this to the database
var ignore = [
    "the",
    "this",
    "that",
    "they",
    "she",
    "before",
    "could",
    "would",
    "should",
    "think",
    "feel",
    "said",
    "says",
    "will",
    "its",
    "it's",
    "there",
    "their",
    "they're"
];

/*
 * Calcuate Term Frequency--Inverse Document Frequency
 */
module.exports = (function() {
    // calculate frequency
    var frequency = function(word, content) {
        var regex = new RegExp(word, 'gi');
        var count = (content.match(regex) || []).length;

        return count;
    };

    // calculate term frequency
    function tf(word, content) {
        var tf = frequency(word, content) / wordCount(content);

        return tf;
    };

    // calculate inverse document frequency
    function idf(word, docs) {
        var idf = Math.log(docs.length) / containing(word, docs);

        return idf;
    };

    // number of times a word occurs across all documents
    function documentCount(word, docs) {
        var count = 0;
        for (var i = 0, n = docs.length; i < n; i++) {
            if (frequency(word, docs[i]) > 0) {
                count += 1;
            }
        }

        return count;
    }

    // word count in a document
    var wordCount = function (content) {
        return Utils.splitWords(content).length;
    }

    // calculate TF-IDF
    var tfidf = function(word, content, docs) {
        if (word.length < 3 || ignore.indexOf(word) !== -1) {
            return 0;
        }

        return tf(word, content) * idf(word, docs);
    };

    return {
        tfidf: tfidf,
        frequency: frequency
    };
})();
