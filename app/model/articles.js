// model schema for articles
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = Schema({
    feed_id: { type: Number, ref: 'Feed' },
    url: {type: String, unique: true},
    title: String,
    summary: String,
    // keywords: [{ type: Schema.Types.ObjectId, ref: 'Keyword'} ],
    location: String,
    time : { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
