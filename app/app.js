// load dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = require('./router');
var Rss = require('./rss');
var Aggregator = require('./aggregator');

var App = (function() {

    // instantiate Rss and Aggregator objects
    var rss = new Rss();
    var aggregator = new Aggregator();

	var init = function() {
		// initialize dependencies
		var app = express();

        // parse body of any POST
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

		// determine port
		var port = process.env.PORT || 8080;

		// register router
		app.use('/api', router);

        // init app
		app.listen(port);

        // set up mongoose connection
        mongoose.connect('mongodb://localhost/articles');
        mongoose.connection
            .on('error', console.error.bind(console, 'connection error:'))
            .once('open', onConnection);
	}

    // run aggregator
    function aggregate() {
        rss.init().then(function(res) {
            // console.log(res);

            // activate aggregator for saved articles
            aggregator.init();
        }, function(err) {
            console.log("aggregator error: ", err)
        });
    };

    function onConnection() {
        console.log("connection established");

        // trigger Rss feed reader
        aggregate();

        // set an interval to poll Rss feeds
        timerId = setInterval(function() {
            aggregate();
        }, 600000);
    }

    return {
        init: init
    }

})();

App.init();
