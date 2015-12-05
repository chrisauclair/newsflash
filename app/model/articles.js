// model schema for articles
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = Schema({
    feed_id: { type: Schema.Types.ObjectId, ref: 'Feed' },
    cluster_id: { type: Schema.Types.ObjectId, ref: 'Cluster'},
    url: {type: String, unique: true},
    title: String,
    summary: String,
    // keywords: [{ type: Schema.Types.ObjectId, ref: 'Keyword'} ],
    location: String,
    pubData: String,
    content: String,
    description: String,
    time : { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
