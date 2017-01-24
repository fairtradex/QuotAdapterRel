/**
 * Created by user on 05/07/2016.
 */
'use strict';

const nconf = require('nconf');
const path =  require('path');

nconf.argv()
    .env()
    .file({ file: path.join(__dirname, 'config.json')});

module.exports = nconf;