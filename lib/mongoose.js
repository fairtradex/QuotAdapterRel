'use strict';

var mongoose = require("mongoose");
var config = require('../../config');

// read from node env
var mode = process.env.NODE_ENV || "development";
mongoose.connect(config.get(mode.concat(":", "mongoose:uri")), config.get(mode.concat(":", "mongoose:options")));
module.exports = mongoose;