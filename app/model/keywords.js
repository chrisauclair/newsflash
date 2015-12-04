// model schema for article keywords
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keywordSchema = Schema({
    keyword: { type: String, unique: true }
});

module.exports = mongoose.model('Keyword', keywordSchema);
