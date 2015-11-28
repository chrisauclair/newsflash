// load dependencies
var express = require('express');
var router = require('./router');

(function() {
	var App = {
		init: function() {
			// initialize dependencies
			var app = express();

			// determine port
			var port = process.env.PORT || 8080;

			// init app
			app.use('/api', router);
			app.listen(port);
		}
	}

	App.init();
})();