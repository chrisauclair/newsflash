var Article = require('../model/articles');
var Feed = require('../model/feeds');
var Keyword = require('../model/keywords');

module.exports = (function() {
    var postArticle = function(body, callback) {
        Article.findOne({url: body.url}).select('_id').exec().then(function(article) {
            if (!article) {

                var article = new Article();
                article.url = body.url;

                article.save(function(err) {
                    if (err) return handleError(err, callback);

                    Feed.findOne({feed: body.feed}).exec().then(function(feed) {
                        if(!feed) {
                            feed = new Feed();
                            feed.feed = body.feed;
                            feed.articles = [];
                        }
                        feed.articles.push(article);
                        feed.update({articles: feed.articles, feed: feed.feed}, {upsert: true}, function(err, raw) {
                            if (err) return handleError(err, callback);

                            article.update({feed_id: feed}, function(err, raw) {
                                if (err) return handleError(err, callback);
                                callback(null, {message: 'article created'});
                            });
                        });
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
