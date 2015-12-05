// model schema for article keywords
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var clusterSchema = Schema({
    articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }]
});

module.exports = mongoose.model('Cluster', clusterSchema);
