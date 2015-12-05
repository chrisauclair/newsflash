// load dependencies
var xhr = require('node-xhr');
var parseString = require('xml2js').parseString;
var articleHelpers = require('./helpers/article');
var Promise = require('node-promise').Promise;
var all = require('node-promise').all;

module.exports = (function(){
    // start with international news for now
    var feeds = [
        "http://www.npr.org/rss/rss.php?id=1009",
        "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml"
    ];

    // TODO determine which params need to be passed to Rss object
    var Rss = function() {

        var parseBody = function(body) {
            console.log("parse body");

            var itemTotal = body.rss.channel[0].item.length;
            var promises = createPromises(itemTotal);

            for (var i = 0; i < itemTotal; i++) {
                console.log("parse item");

                var promise = promises[i];

                var item = body.rss.channel[0].item[i];

                var content = (item['content:encoded']) ? item['content:encoded'][0] : item.description[0];

                var articleBody = {
                    feed: body.rss.channel[0].title[0],
                    title: item.title[0],
                    url: item.link[0],
                    pubDate: item.pubDate[0],
                    description: item.description[0],
                    content: content,
                    summary: "",
                    location: ""
                };

                articleHelpers.postArticle(articleBody, promise);
            }

            return all(promises);
        }

        function createPromises(num) {
            var promises = [];
            for (var i = 0; i < num; i++) {
                var promise = new Promise();
                promises.push(promise);
            }

            return promises;
        }

        var getRss = function(feed, promise) {
            xhr.get({
                url: feed,
            }, function(err, res) {
                if (err) {
                    console.log(err.message);
                    promise.reject(err);
                } else {
                    if (res.status.code !== 200) {
                        console.log("Rss GET failed");
                        promise.reject(res.body);
                    }

                    parseString(res.body, function(err, body) {
                        if (err) {
                            console.log("reject parse body: ", err);
                            promise.reject(err);
                            return;
                        }

                        parseBody(body).then(function(res) {
                            promise.resolve(res);
                        }, function(err) {
                            promise.reject(err);
                        });
                    });
                }
            });
        }

        // public methods of object instance
        Rss.prototype.init = function() {
            console.log("rss init");

            var promises = createPromises(feeds.length);

            for (var i = 0, n = feeds.length; i < n; i++) {
                getRss(feeds[i], promises[i]);
            }

            return all(promises);
        }
    }

    return Rss;
})();
