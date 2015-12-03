// model schema for article publishers
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedSchema = Schema({
    feed: { type: String, unique: true },
    // articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }]
});

module.exports = mongoose.model('Feed', feedSchema);
