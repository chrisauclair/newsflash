var _ = require('lodash');
var Article = require('../model/articles');
var Feed = require('../model/feeds');
var Keyword = require('../model/keywords');

module.exports = (function() {

    // create an article document in the database if it doesn't exist
    var postArticle = function(body, promise) {
        Article.findOne({url: body.url}).select('_id').exec(function(err, article) {
            if (err) return handleError(err, promise);
            if (!article) {

                // create new article
                var article = new Article();
                article = _.extend(article, body);

                // create feed if not in the database
                Feed.findOneAndUpdate({feed: body.feed}, {$set: {feed: body.feed}}, {upsert: true, new: true}, function(err, res) {
                    if (err) return handleError(err, promise);

                    // get feed id for article
                    article.feed_id = res;

                    // save article
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

    // update an article in the database
    var updateArticle = function(body, promise) {
        var updateBody = body;
        Article.findOneAndUpdate({url: body.url}, {$set: updateBody}, {}, function(err, res) {
            if (err) return handleError(err, promise);

            if (promise) promise.resolve({message: 'article updated'});
        });
    };

    // get an article in the database
    // TODO: pass in search and options as arguments
    var getArticles = function(promise) {
        Article.find({'cluster_id': { $exists: true }}, null, { limit: 20})
            .populate({path: 'cluster_id', select: '_id'})
            .populate({path: 'feed_id', select: 'feed'})
            .sort({time: -1})
            .exec(function(err, res) {
                if (err) return handleError(err, promise);

                promise.resolve(res);
            });
    }

    // get a single article by id
    var getArticle = function(id, promise) {
        Article.findById(id).populate({path: 'cluster_id', select: '_id'}).populate({path: 'feed_id', select: 'feed'}).exec(function(err, res) {
            if (err) return handleError(err, promise);

            promise.resolve(res);
        });
    }

    // handle any errors
    function handleError(err, promise) {
        // console.log(err);
        if (promise) promise.reject(err);
    }

    return {
        postArticle: postArticle,
        updateArticle: updateArticle,
        getArticles: getArticles,
        getArticle: getArticle
    }
})();
