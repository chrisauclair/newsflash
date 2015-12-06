// load dependencies
var express = require('express');
var router = express.Router();
var articleHelpers = require('./helpers/article');
var clusterHelpers = require('./helpers/cluster');
var Promise = require('node-promise').Promise;

// middleware for requests
router.use(function(req, res, next) {
    // TODO API authentication for a POST would go here
    next();
});

// test page
router.get('/', function(req, res) {
    res.json({ message: 'api test' });
});

// routes for articles
router.route('/articles')
    /*
    // create article (for a seperate RSS/aggregator application)
    .post(function(req, res) {
        console.log("POST article: ", req.body);

        var promise = new Promise();
        articleHelpers.postArticle(req.body, promise);
        promise.then(function(res) {
            console.log("callback: ", res);
            res.send(response);
        }, function(err) {
            console.log("callback: ", err);
            res.send(err);
        });
    }) */

    // get most recent articles
    // TODO: accept search, sort, and limit criteria
    .get(function(req, res) {
        console.log("GET articles");

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

// routes for clusters
router.route('/clusters/:cluster_id')

    // get cluster by the cluster id
    .get(function(req, res) {
        var promise = new Promise();
        clusterHelpers.getCluster(req.params.cluster_id, promise);
        promise.then(function(cluster) {
            console.log("callback: ", cluster);
            res.send(cluster);
        }, function(err) {
            console.log("callback: ", err);
            res.send(err);
        });
    });

// handle any error responses
function handleError(res, err) {
    res.send(err);
}

module.exports = router;
