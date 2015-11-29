// model schema for article keywords
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keywordSchema = Schema({
    keyword: String
});

module.exports = mongoose.model('Keyword', keywordSchema);
