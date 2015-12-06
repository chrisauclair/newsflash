# NewsFlash

## Overview
A backend service for a news aggregator. Created as a final project for [CS50](https://cs50.harvard.edu/) (and as a vacation from front end design).

## Getting up and running

Clone a copy of this repository, then install the necessary software.

### Necessary software
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://docs.mongodb.org/manual/installation/)

### Helpful software
- [Postman](https://www.getpostman.com/)
- [MongoHub](https://github.com/jeromelebel/MongoHub-Mac)

### Install and run

1. Open up a command or terminal window, change directory (`cd`) to your repository.
2. Install all Node packages by executing `npm install`.
3. Next, initalize the database. Open a new terminal or command window. To avoid permissions errors and encasulate the whole project, the database is saved within the repo. Initialize the database with `mongod --dbpath /path/to/repo/db`. Windows users may need to call the executable directly (and use DOS-style paths).
4. Once the database is running, start the application. In the terminal window from step 1, execute `npm start`. The application will initialize, triggering an RSS read, followed by aggregation.
5. Leave the database and aggregator running in the background. The aggregator will log new cluster information to the console every time it reads new RSS feeds.

## Using the API

I recommend [Postman](https://www.getpostman.com/) for testing API GET and POST calls.

This application has a set of services for front-end applications to:
- Get the most recent articles from the feed, along with "clusters" that identify similar articles
- Request all articles in a cluster

### Testing host
localhost:8080/api

### GET /articles

Example: `GET http://localhost:8080/api/articles`

Get a list of the most recent articles from the feed. The test feed is pre-filtered for world news (keyword filtering was not implemented due to the small initial sample size).

#### Response:
```
[
	{
		"title": "Article title",
		"feed_id": {
			"feed": "RSS Service Name"
		},
		"summary": "Top 4 sentences from article.",
		"content": "Full HTML content of article.",
		"description": "Short description of article.",
		"cluster_id": {
			"_id": "ID of cluster"
		}
	},
	{
		...
	}
]
```

### GET /articles/:article_id

Example: `GET http://localhost:8080/api/articles/56639032ca0b7f6720cc2a79`

Get a single article by its id.

#### Response:
```
{
	"title": "Article title",
	"feed_id": {
		"feed": "RSS Service Name"
	},
	"summary": "Top 4 sentences from article.",
	"content": "Full HTML content of article.",
	"description": "Short description of article.",
	"cluster_id": {
		"_id": "ID of cluster"
	}
}
```

### GET /clusters/:cluster_id

Example: `GET http://localhost:8080/api/clusters/56636d967cbc612a1b943c32`

Get a list of all articles in a clusters. Clusters are stored indefinitely right now, so even if an article is knocked out of a cluster, it can still show similar content if it gets requested. The `cluster_id` can be obtained through an article record.

#### Response:
```
{
	"articles": [
		{
			"title": "Article title",
			"feed_id": {
				"feed": "RSS Service Name"
			},
			"summary": "Top 4 sentences from article.",
			"content": "Full HTML content of article.",
			"description": "Short description of article.",
			"cluster_id": {
				"_id": "ID of cluster"
			}
		},
		{
			...
		}
	]
}
```
