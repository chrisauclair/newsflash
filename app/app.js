// load dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = require('./router');
var Rss = require('./rss');
var Aggregator = require('./aggregator');

var App = (function() {

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

        mongoose.connect('mongodb://localhost/test');

        mongoose.connection
            .on('error', console.error.bind(console, 'connection error:'))
            .once('open', onConnection);
	}

    function onConnection() {
        console.log("connection established");

        // trigger Rss feed reader
        var rss = new Rss();
        rss.init().then(function(res) {
            // console.log(res);

            // activate aggregator for saved articles
            var aggregator = new Aggregator();
            aggregator.init();
        }, function(err) {
            // console.log(err);
        });
    }

    return {
        init: init
    }

})();

App.init();
