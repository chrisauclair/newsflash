var Article = require('../model/articles');
var Cluster = require('../model/clusters');
var Feed = require('../model/feeds');

module.exports = (function() {

    // get cluster data by id
    var getCluster = function(id, promise) {
        Cluster.findById(id).populate({path: 'articles', populate: {path: 'feed_id'}}).exec(function(err, res) {
            if (err) return handleError(err, promise);

            promise.resolve(res);
        });
    }

    // handle any errors
    function handleError(err, promise) {
        console.log(err);
        if (promise) promise.reject(err);
    }

    return {
        getCluster: getCluster
    }
})();
