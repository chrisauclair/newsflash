// load dependencies
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var parseString = require('xml2js').parseString;
var Utils = require('./utils/utils');
var articleHelpers = require('./helpers/article');
var all = require('node-promise').all;

module.exports = (function(){
    // start with international news for now
    var feeds = [
        "http://www.npr.org/rss/rss.php?id=1009",
        "http://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
        "http://rss.cnn.com/rss/edition_meast.rss",
        "http://www.economist.com/sections/middle-east-africa/rss.xml",
        "http://www.theguardian.com/world/middleeast/rss",
        "http://feeds.washingtonpost.com/rss/world",
        "http://www.ft.com/rss/home/middleeast",
        "http://www.ipsnews.net/news/regional-categories/middle-east/feed/",
        "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml"
    ];

    // TODO determine which params need to be passed to Rss object
    var Rss = function() {

        var parseBody = function(body) {
            console.log("parse body");

            var itemTotal = body.rss.channel[0].item.length;
            var promises = Utils.createPromises(itemTotal);

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

        var getRss = function(feed, promise) {

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (xhr.status !== 200 && xhr.status !== 302) {
                        xhr.handleError("Invalid response: " + xhr.status);
                        promise.reject(err);
                        return;
                    }

                    parseString(this.responseText, function(err, body) {
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

                    })

                }

                if (this.readyState === 2) {
                                    }
            }

            xhr.open("GET", feed);
            xhr.send();

        }

        // public methods of object instance
        Rss.prototype.init = function() {
            console.log("rss init");

            var promises = Utils.createPromises(feeds.length);

            for (var i = 0, n = feeds.length; i < n; i++) {
                getRss(feeds[i], promises[i]);
            }

            return all(promises);
        }
    }

    return Rss;
})();
