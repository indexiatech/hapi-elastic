'use strict';

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var ElasticSearch = require('elasticsearch');
var ElasticSearchPlugin = require('../lib/index');

var internals = {};

var lab = exports.lab = Lab.script();
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('Plugin client Tests', function () {

    it('should expose client instance by the `es` property', function (next) {

        var server = new Hapi.Server();
        server.connection();
        server.register({ register: ElasticSearchPlugin, options: {} }, function (err) {

            if (err) { return next(err); }
            var plugin = server.plugins['hapi-elastic'];
            expect(plugin.es).to.exist();
            next();
        });
    });

    it('should default configuration be localhost & port as 9200', function (next) {

        var server = new Hapi.Server();
        server.connection();
        server.register({ register: ElasticSearchPlugin, options: {} }, function (err) {

            if (err) { return next(err); }
            var config = server.plugins['hapi-elastic'].es.transport._config;
            expect(config.localhost).to.exist();
            expect(config.localhost).to.equal(9200);
            next();
        });
    });

    it('should pass all `config` options hash to the client', function (next) {

        var server = new Hapi.Server();
        server.connection();
        server.register({ register: ElasticSearchPlugin, options: {
            config: {
                apiVersion: '1.2'
            }
        } }, function (err) {

            if (err) { return next(err); }
            var config = server.plugins['hapi-elastic'].es.transport._config;
            expect(config.apiVersion).to.equal('1.2');
            next();
        });
    });
});

describe('Test handling of Elastic Errors', function () {

    var server;
    beforeEach( function (next) {

        server = new Hapi.Server();
        server.connection();
        server.register({ register: ElasticSearchPlugin, options: {} }, function (err) {

            if (err) { return next(err); }

            //add routes

            //success route
            server.route({ method: 'GET', path: '/query',
                handler: function (request, reply) {

                    reply({ success: true });
                }
            });

            //create an error route
            var ErrRoute = function (path, Error) {

                this.method = 'GET';
                this.path = path;
                this.handler = function (request, reply) {

                    reply(new Error());
                };
            };

            server.route(new ErrRoute('/not-found', ElasticSearch.errors.NotFound));
            server.route(new ErrRoute('/conflict', ElasticSearch.errors.Conflict));
            server.route(new ErrRoute('/generic', ElasticSearch.errors.Generic));
            next();
        });
    });

    it('Test success call', function (next) {

        server.inject('/query', function (resp) {

            expect(resp.statusCode).to.equal(200);
            next();
        });
    });

    it('Not Found(404)', function (next) {

        server.inject('/not-found', function (resp) {

            expect(resp.statusCode).to.equal(404);
            next();
        });
    });

    it('Conflict(409)', function (next) {

        server.inject('/conflict', function (resp) {

            expect(resp.statusCode).to.equal(409);
            next();
        });
    });
});
