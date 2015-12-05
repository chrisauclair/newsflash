// load dependencies
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var parseString = require('xml2js').parseString;
var Utils = require('./utils/utils');
var articleHelpers = require('./helpers/article');
var all = require('node-promise').all;

module.exports = (function(){

    // TODO: branch feeds into categories and store in the Feed model in the database
    // test feeds of some international news
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

    var Rss = function() {

        // parse the body of each XML document and post to database
        var parseBody = function(body) {
            // console.log("parse article");

            // create promises for each item to wait for response from save
            var promises = Utils.createPromises(itemTotal);

            // iterate through each item
            var itemTotal = body.rss.channel[0].item.length;
            for (var i = 0; i < itemTotal; i++) {
                // console.log("parse item");

                // get item and content
                var item = body.rss.channel[0].item[i];
                var content = (item['content:encoded']) ? item['content:encoded'][0] : item.description[0];

                // build body to match Article schema
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

                // save to database
                articleHelpers.postArticle(articleBody, promises[i]);
            }

            // return promises
            return all(promises);
        }

        // get Rss XML for feed
        var getRss = function(feed, promise) {

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {
                // check for status
                if (this.readyState === 4) {

                    // reject with error for incorrect status
                    if (xhr.status !== 200 && xhr.status !== 302) {
                        xhr.handleError("Invalid response: " + xhr.status);
                        promise.reject(err);
                        return;
                    }

                    // convert response to JSON
                    parseString(this.responseText, function(err, body) {
                        if (err) {
                            console.log("reject parse body: ", err);
                            promise.reject(err);
                            return;
                        }

                        // parse and resolve promise
                        parseBody(body).then(function(res) {
                            promise.resolve(res);
                        }, function(err) {
                            promise.reject(err);
                        });

                    })

                }
            }

            // GET feed
            xhr.open("GET", feed);
            xhr.send();
        }

        // initiate Rss reader
        Rss.prototype.init = function() {
            console.log("rss init");

            // create promises for feeds
            var promises = Utils.createPromises(feeds.length);

            // get Rss for each feed
            for (var i = 0, n = feeds.length; i < n; i++) {
                getRss(feeds[i], promises[i]);
            }

            // return all promises
            return all(promises);
        }
    }

    return Rss;
})();
