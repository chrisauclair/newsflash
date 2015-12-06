# Design

## Overview

The NewsFlash application is a set of backend services written in Node.js that aggregates recent news articles for a front end service. The current servies are clustering - to pick out articles by relevance and suggest similar — and summarization.

I chose Node.js for this app due to the large collection of well-maintained libraries, and the ease with which it can start a server and route HTTP calls.

Thanks to those whose code samples and advice helped carry me forward:
[http://www.p-value.info/2012/12/howto-build-news-aggregator-in-100-loc.html](http://www.p-value.info/2012/12/howto-build-news-aggregator-in-100-loc.html)
[http://blog.christianperone.com/2011/10/machine-learning-text-feature-extraction-tf-idf-part-ii/](http://blog.christianperone.com/2011/10/machine-learning-text-feature-extraction-tf-idf-part-ii/)
[https://www.quora.com/Information-Retrieval/What-are-the-relative-advantages-disadvantages-of-various-semantic-similarity-measures](https://www.quora.com/Information-Retrieval/What-are-the-relative-advantages-disadvantages-of-various-semantic-similarity-measures)
[https://www.quora.com/How-can-I-create-an-aggregated-news-feed-app-such-as-Summly-or-Pulse](https://www.quora.com/How-can-I-create-an-aggregated-news-feed-app-such-as-Summly-or-Pulse)
[https://www.ibm.com/developerworks/community/blogs/nlp/entry/tokenization?lang=en](https://www.ibm.com/developerworks/community/blogs/nlp/entry/tokenization?lang=en)
[http://solutionoptimist.com/2013/12/27/javascript-promise-chains-2/](http://solutionoptimist.com/2013/12/27/javascript-promise-chains-2/)

## Database

The app relies on MongoDB for its database. After mapping out my database needs for articles, feeds, clusters, and keywords (not implemented), I decided that this app only does one thing and there will be few relationships in the data. MongoDB seemed better suited to low-relationship datasets and quick development/test cycles compared to SQL.

The node module used to access the database is Mongoose.

## Routing and API

The app would just be a black box without an API. There were three types of "GET" that I determined necessary for this version of the app: get recent articles, get a single article, and get a cluster of articles. The API service is RESTful just for the cleanliness of the URLs.

The routing package used to set up the API and handle the routing is Express. The default port for the development environment is 8080 to avoid permissions conflicts on the developer's machine.

## RSS Feeds

This version of the app uses a hard-coded set of pre-selected feeds to mimic the type of filtering that would be done server-side in advance by the developer and on the client side by the user.

The RSS reader is a single instantiated object. When the init() method is called, it requests data for each feed from the feed URL. When it receives data, it scans the database for the article and the feed name, and adds them if they don't exist. The init method returns promise so that other services can wait for it to finish before accessing or modifying the database. I chose promises instead of callbacks because it's easier to build strings of method calls that are visibly sequential in the code.

The RSS reader (and the aggregation) are designed to run every 10 minutes.

## Aggregation

Like the RSS reader, the aggregator is a single instantiated object. Once the the RSS reader resolves its promise, the aggregator init() method is called. This method gets every article from the database, then does a few important things. First, it gets a master selection of keywords based on the top 4 keywords in each document. The top 4 are identified using Term Frequency–Inverse Document Frequency (TF-IDF), which was simply the most recommended algorithm for determining word relevance. Once keywords are identied, a vector grid is created for every keyword in every document, rating each by TF-IDF. Then, an article similarity vector grid is created by comparing each article's keyword vectors against every other article's vectors, using cosine similarity. Cosine similarity isn't very accurate, but there was a library available for the calculation. If I had to re-implment the aggregator, I would look at another algorithm entirely like Latent Dirichlet allocation (LDA) and try to reduce all of the iteration loops. Finally, the last vector grid is passed through a hierarchical clustering library. I suspect that the hard-coded distance threshold that determines when to break a cluster off from the rest of the tree isn't very accurate over the long term and may need to be adjusted over time based on the data.

Once clusters are identified, they're saved to the database and each article in the cluster has its "cluster_id" changed. Stale clusters are not currently wiped because I couldn't work out a good method for how long to keep them. If an article doesn't make the cut for a new cluster, I still want it to maintain its relationship to the old cluster for at least until the article itself is stale.

I was hoping to have time to implement keyword saving in the database, with a measure of frequency and relevance. Also, articles would have their keywords saved in the database to help with filtering.

