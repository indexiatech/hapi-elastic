# Elastic Search Hapi plugin

This Hapi plugin creates a single elastic client with appropriate error handling that can be used across the application,

This plugin has 100% test coverage.


## Features

- Configurable via Hapi configuration standards.
- Single client instance.

## Installation

```sh
npm install --save hapi-elastic
```

## Usage example

```js
var ElasticPlugin = require('hapi-elastic');
var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection();

// Pass options.config to elastic client constructor
var clientOptions = { 
  config: {
    host: "http://localhost:9200" 
  }
}

server.register({ register: ElasticPlugin, options: clientOptions }, function (err) {
  //get elastic client from plugin
  var es = server.plugins['hapi-elastic'].es;
});
```

The `options.config` hash is passed to the elastic search client, for more info about 
possible configuration parameters please see the Elastic client [configuration documentation](http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/configuration.html)
