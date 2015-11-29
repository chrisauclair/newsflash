// model schema for article creators
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var creatorSchema = Schema({
    name: String,
    age: Number,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Article' }]
});

module.exports = mongoose.model('Creator', creatorSchema);
