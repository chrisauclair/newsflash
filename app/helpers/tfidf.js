// load depedencies
var _ = require('lodash');
var Utils = require('../utils/utils');

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

module.exports = (function() {
    var frequency = function(word, content) {
        var regex = new RegExp(word, 'gi');
        var count = (content.match(regex) || []).length;

        return count;
    };

    function tf(word, content) {
        var tf = frequency(word, content) / wordCount(content);

        return tf;
    };

    function idf(word, docs) {
        var idf = Math.log(docs.length) / containing(word, docs);

        return idf;
    };

    function containing(word, docs) {
        var count = 0;
        for (var i = 0, n = docs.length; i < n; i++) {
            if (frequency(word, docs[i]) > 0) {
                count += 1;
            }
        }

        return count;
    }

    var wordCount = function (content) {
        return Utils.splitWords(content).length;
    }

    var tfidf = function(word, content, docs) {
        if (word.length < 3 || ignore.indexOf(word) != -1) {
            // console.log("below 3: ", word);
            return 0;
        }

        return tf(word, content) * idf(word, docs);
    };

    return {
        tfidf: tfidf,
        frequency: frequency
    };
})();
