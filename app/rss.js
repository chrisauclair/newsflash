// load dependencies
var xhr = require('node-xhr');

module.exports = (function(){
    // start with international news for now
    var feeds = ["http://www.npr.org/rss/rss.php?id=1009"];

    // TODO determine which params need to be passed to Rss object
    var Rss = function() {

        for(var i = 0, n = feeds.length; i < n; i++) {
            xhr.get({
                url: feeds[i],

            }, function(err, res) {
                if (err) {
                    console.log(err.message);
                    next;
                }
            });
        }

        // public functions of object instance
        Rss.prototype = {

        };

    }

    return Rss;
})();
