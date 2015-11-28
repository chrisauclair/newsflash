// load dependencies
var express = require('express');
var router = express.Router();

// test router
router.get('/', function(req, res) {
	res.json({message: 'hello, world!'});
});

module.exports = router;
