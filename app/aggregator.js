// load dependencies
var _ = require('lodash');
var striptags = require('striptags');
var Article = require('./model/articles');

module.exports = (function() {
    var Aggregator = function() {

        var wordCount = 0;

        var processArticle = function(doc) {
            console.log("process article");
            var content = doc.content;
            var title = doc.title;

            var words = _.words(striptags(content));

            console.log(words);
        }

        function handleError(err) {
            console.log("process article error: ", err);
        }

        Aggregator.prototype.init = function() {
            Article.find().exec(function(err, docs) {
                if (err) return handleError(err);

                for (var i = 0, n = docs.length; i < n; i++) {
                    processArticle(docs[i]);
                }
            });
        }
    };

    return Aggregator;
})();
