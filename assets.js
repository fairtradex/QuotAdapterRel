'use strict';

var _asset = require('./model/asset.model');

var _redisClient = require('./lib/redis-client');

/**
 * Created by vadimsky on 13/10/16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');


var options = {
    url: 'https://autoactionservice.fairtrade.co.il/AutoAction.svc/json/GetAssetList',
    method: 'POST',
    json: true
};

//agent = new https.Agent(options);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3001; // set our port
port = 3001;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/assets', function (req, res) {

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            (function () {
                // from within the callback, write data to response, essentially returning it.
                // res.send(body);
                var assets = [];
                body.d.forEach(function (el) {
                    assets.push(new _asset.Asset({
                        id: el.Id,
                        name: el.Name,
                        active: el.IsActive
                    }));
                });

                _redisClient.redisClient.set("AssetsDescription", JSON.stringify(assets), function (err, reply) {
                    console.log(reply);
                });
                res.json(assets);
            })();
        } else {
            console.error(error.toString());
            res.json({ message: 'request failed! welcome to our api!' });
        }
    });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Assets service API listen port ' + port);