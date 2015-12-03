// load dependencies
var xhr = require('node-xhr');
var parseString = require('xml2js').parseString;
var articleHelpers = require('./helpers/article');

module.exports = (function(){
    // start with international news for now
    var feeds = ["http://www.npr.org/rss/rss.php?id=1009"];

    // TODO determine which params need to be passed to Rss object
    var Rss = function(server) {

        this.server = server;

        var parseBody = function(err, body) {
            console.log("parse body");
            if (err) {
                console.log(err.message);
            } else {
                for (var i = 0, n = body.rss.channel[0].item.length; i < n; i++) {
                    var item = body.rss.channel[0].item[i];
                    // console.log(item);
                    parseItem(body.rss.channel[0].title[0], item);
                }
            }
        }

        var parseItem = function(title, item) {
            console.log("parse item");
            var body = {
                feed: title,
                url: item.link[0],
                pubDate: item.pubDate[0],
                description: item.description[0],
                content: item['content:encoded'][0],
                summary: "",
                location: ""
            };

            postItem(body);
        }

        var postItem = function(body) {
            articleHelpers.postArticle(body, function(err, success) {
                if (err) {
                    console.log(err);
                    return;
                }

                console.log(success);
            });
        }

        // public methods of object instance
        Rss.prototype.init = function() {
            console.log("rss init");
            for(var i = 0, n = feeds.length; i < n; i++) {

                xhr.get({
                    url: feeds[i],

                }, function(err, res) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        parseString(res.body, parseBody);
                    }
                });
            }
        }
    }

    return Rss;
})();
