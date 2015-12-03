var _ = require('lodash');
var Article = require('../model/articles');
var Feed = require('../model/feeds');
var Keyword = require('../model/keywords');

module.exports = (function() {
    var postArticle = function(body, callback) {
        Article.findOne({url: body.url}).select('_id').exec().then(function(article) {
            if (!article) {

                var article = new Article();
                var feed = new Feed();
                article = _.extend(article, body);
                Feed.findOneAndUpdate({feed: body.feed}, {$set: {feed: body.feed}}, {upsert: true, new: true}, function(err, res) {
                    if (err) return handleError(err, callback);

                    article.feed_id = res;

                    article.save(function(err){
                        if (err) return handleError(err, callback);

                        callback(null, {message: 'article saved'});
                    });
                });
            }
            else {
                handleError({message: 'article already exists'}, callback);
            }
        });
    }

    function handleError(err, callback) {
        callback(err);
    }

    return {
        postArticle: postArticle
    }
})();
