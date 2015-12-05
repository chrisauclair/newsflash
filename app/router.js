// load dependencies
var express = require('express');
var router = express.Router();
var articleHelpers = require('./helpers/article');
var Promise = require('node-promise').Promise;

// middleware for requests
router.use(function(req, res, next) {
    // TODO API authentication would go here
    next();
});

// test page
router.get('/', function(req, res) {
    res.json({ message: 'api test' });
});

// create/update article
router.route('/articles')
    .post(function(req, res) {
        console.log("new article POST: ", req.body);

        var promise = new Promise();
        articleHelpers.postArticle(req.body, promise);
        promise.then(function(res) {
            console.log("callback: ", res);
            res.send(response);
        }, function(err) {
            console.log("callback: ", err);
            res.send(err);
        });
    })
    .get(function(req, res) {
        console.log("new articles GET");

        var promise = new Promise();
        articleHelpers.getArticles(promise);
        promise.then(function(articles) {
            console.log("callback: ", articles);
            res.send(articles)
        }, function(err) {
            console.log("callback: ", err);
            res.send(err);
        });
    });

function handleError(res, err) {
    res.send(err);
}

module.exports = router;
