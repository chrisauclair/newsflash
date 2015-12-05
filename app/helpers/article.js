var _ = require('lodash');
var Article = require('../model/articles');
var Feed = require('../model/feeds');
var Keyword = require('../model/keywords');

module.exports = (function() {
    var postArticle = function(body, promise) {
        Article.findOne({url: body.url}).select('_id').exec().then(function(article) {
            if (!article) {

                var article = new Article();
                var feed = new Feed();
                article = _.extend(article, body);
                Feed.findOneAndUpdate({feed: body.feed}, {$set: {feed: body.feed}}, {upsert: true, new: true}, function(err, res) {
                    if (err) return handleError(err, promise);

                    article.feed_id = res;

                    article.save(function(err){
                        if (err) return handleError(err, promise);
                        if (promise) promise.resolve({message: 'article saved'});
                    });
                });
            }
            else {
                handleError({message: 'article already exists'}, promise);
            }
        });
    }

    var updateArticle = function(body, promise) {
        var updateBody = body;
        Article.findOneAndUpdate({url: body.url}, {$set: updateBody}, {}, function(err, res) {
            if (err) return handleError(err, promise);

            if (promise) promise.resolve({message: 'article updated'});
        });
    };

    var cleanClusters = function(body, promise) {

    }

    function handleError(err, promise) {
        if (promise) promise.reject(err);
    }

    return {
        postArticle: postArticle,
        updateArticle: updateArticle,
        cleanClusters: cleanClusters
    }
})();
