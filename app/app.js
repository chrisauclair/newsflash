// load dependencies
var express = require('express');
var mongoose = require('mongoose');
var router = require('./router');
var Rss = require('./rss');

var App = (function() {

	var init = function() {
		// initialize dependencies
		var app = express();

		// determine port
		var port = process.env.PORT || 8080;

		// init app
		app.use('/api', router);
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
    }

    return {
        init: init
    }

})();

App.init();
