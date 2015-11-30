// load dependencies
var express = require('express');
var router = express.Router();
var Article = require('./model/articles');
var Feed = require('./model/feeds');
var Keyword = require('./model/keywords');

// middleware for requests
router.use(function(req, res, next) {
    // API authentication would go here
    next();
});

// test page
router.get('/', function(req, res) {
    res.json({ message: 'api test' });
});

// create/update article
router.route('/articles')
    .post(function(req, res) {
        console.log(req.body.url);

        Article.findOne({url: req.body.url}).select('_id').exec().then(function(article) {
            if (!article) {

                var article = new Article();
                article.url = req.body.url;

                article.save(function(err) {
                    if (err) {
                        res.send(err);
                        return;
                    }

                    Feed.findOne({feed: req.body.feed}).exec().then(function(feed) {
                        if(!feed) {
                            feed = new Feed();
                            feed.feed = req.body.feed;
                        }
                        feed.articles.push(article);
                        feed.update({articles: feed.articles}, function(err, raw) {
                            if (err) {
                                res.send(err);
                                return;
                            }
                        })
                    });
                });

                res.send({message: 'article created'});
            }
            else {
                res.send({message: 'article already exists'});
            }
        });
    });

module.exports = router;
