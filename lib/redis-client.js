"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by vadimsky on 20/10/16.
 */

var config = require('../../config');

// read from node env
var mode = process.env.NODE_ENV || "development";
var redisOptions = config.get(mode.concat(":", "redis"));

var redis = require('redis');

var redisClient = exports.redisClient = redis.createClient(redisOptions.port, redisOptions.host, {
    auth_pass: redisOptions.password,
    tls: {
        servername: redisOptions.host
    }
});