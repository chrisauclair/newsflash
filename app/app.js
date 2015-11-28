// load dependencies
var express = require('express');
var port = process.env.PORT || 8080;

// initialize dependencies
var app = express();
var router = express.Router();

// test router
router.get('/', function(req, res) {
	res.json({message: 'hello, world!'});
});

// init app
app.use('/api', router);
app.listen(port);