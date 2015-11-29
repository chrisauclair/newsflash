// model schema for articles
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = Schema({
    _creator: {type: Number, ref: 'Creator'},
    url: String,
    service: Number,
    title: String,
    summary: String;
    keywords: [{type: Schema.Types.ObjectId, ref: 'Keyword'}],
    location: String,
    time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
