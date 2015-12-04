// load dependencies
var Article = require('./model/articles');

module.exports = (function() {
    var Aggregator = function() {

        var processArticle = function(doc) {
            console.log("process article");
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
