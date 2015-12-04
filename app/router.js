// load dependencies
var express = require('express');
var router = express.Router();
var articleHelpers = require('./helpers/article');

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
        console.log("request: ", req.body);
        articleHelpers.postArticle(req.body, function(err, response) {
            console.log("callback: ", err, response);
            if(err) return handleError(res, err);
            res.send(response);
        });
    });

function handleError(res, err) {
    res.send(err);
}

module.exports = router;
