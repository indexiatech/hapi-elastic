//Load Modules

var Hoek = require('hoek');
var Joi = require('joi');
var Boom = require('boom');
var ElasticSearch = require('elasticsearch');

// Declare internals
var internals = {
    defaults: {
        config: {
            localhost:9200
        }
    }
};

exports.register = function (plugin, options, next) {

    var Hapi = plugin.hapi;
    var settings = Hoek.applyToDefaults(internals.defaults, options);
    plugin.log(['hapi-elastic'], 'Hapi Elastic plugin registration started.');
    plugin.expose('es', new ElasticSearch.Client(settings.config));

    plugin.ext('onPostHandler', function (req, rep) {

        var response = req.response;
        if (response instanceof ElasticSearch.errors._Abstract) {
            rep(Boom.create(response.status, response.message, response));
        } else {
            rep.continue();
        }
    });

    plugin.log(['hapi-elastic'], 'Hapi Elastic plugin registration ended.');
    return next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
