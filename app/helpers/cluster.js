var Article = require('../model/articles');
var Cluster = require('../model/clusters');
var Feed = require('../model/feeds');

module.exports = (function() {
    var getCluster = function(id, promise) {
        console.log(id);
        // .populate({feed: 'feed_id', select: 'feed'})
        Cluster.findById(id).populate({path: 'articles', populate: {path: 'feed_id'}}).exec(function(err, res) {
            if (err) return handleError(err, promise);

            promise.resolve(res);
        });
    }

    function handleError(err, promise) {
        console.log(err);
        if (promise) promise.reject(err);
    }

    return {
        getCluster: getCluster
    }
})();
