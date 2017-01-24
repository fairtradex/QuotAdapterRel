/**
 * Created by user on 09/08/2016.
 */
'use strict';

/*const express = require('express');*/

var _qoutes = require('./qoutes');

var _redisClient = require('../lib/redis-client');

var signalR = require('signalr-client');

var config = require('../../config');

var mode = process.env.NODE_ENV || "development";
var redisOptions = config.get(mode.concat(":", "redis"));

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(3050);

var signalRConfig = {
    server: "wss://devapp.fairtrade.co.il/signalr",
    hubs: ['packethub', 'balanceHub'],
    hubMethod: ["updatepagebynewdata", "syncuserclocktoserverclock", "setcalcactionResult", "setnewexpirytoasset", "updatetradesatexpiry", "updateassetactivestatus", "OnConnectedMobile", "updatebalancemobile"],
    emitData: "orderBooks",
    token: "d4c6573421cb4ac2ed836a85fd54cfc77b4e1c1688bbcbecc862de9dd221233f"
};

// var store = redis.createClient();
// var pub = redis.createClient();
// var sub = redis.createClient();

// const redisAdapter = require('socket.io-redis');
// io.adapter(redisAdapter(redisOptions));

io.on('ORDER-BOOK', function (socket) {
    socket.on('orderBooks', function (msg) {
        io.emit('orderBooks', msg);
    });
});

var client = new signalR.client(

//signalR service URL
signalRConfig.server,

// array of hubs to be supported in the connection
signalRConfig.hubs, 2, /* Reconnection Timeout is optional and defaulted to 10 seconds */
false /* doNotStart is option and defaulted to false. If set to true client will not start until .start() is called */
);

client.proxy.host = "127.0.0.1";
client.proxy.port = "443";

var jsonData = {};

client.handlers.balancehub = {
    OnConnectedMobile: function OnConnectedMobile(args) {
        console.log(JSON.stringify(args));
    },

    // Private Balance
    updatebalancemobile: function updatebalancemobile(userId, balance) {
        console.log(balance, userId);
        io.emit(userId, { type: "BALANCE_UPDATE", "payload": balance });
    }
};

// hub name must be all lower case.
client.handlers.packethub = {
    // method name must be all lower case
    //		function signature should match call from hub
    // OnConnectedMobile: (args) => {
    //     console.log(JSON.stringify(args));
    // },

    updatepagebynewdata: function updatepagebynewdata(name, message) {
        //console.log("revc => " + JSON.stringify(name)  + "\n" + JSON.stringify(message));
        //console.log("---update quotes-- \n");
        jsonData = {
            "name": name,
            "message": message
        };

        _redisClient.redisClient.get("assets", function (err, reply) {
            var prevAssets = JSON.parse(reply);
            // console.log(reply);

            var quotesBook = (0, _qoutes.treatQuotesUpdate)(jsonData.name, jsonData.message, prevAssets, assetsDescription);
            _redisClient.redisClient.set("assets", JSON.stringify(quotesBook.assets), function (err, reply) {
                // console.log(reply);
            });

            //console.log(JSON.stringify(quotesBook));
            io.emit('orderBooks', JSON.stringify(quotesBook));
        });
    },

    syncuserclocktoserverclock: function syncuserclocktoserverclock(serverUTCClock) {
        var dateTime = new Date(serverUTCClock);
        console.log("---update clock-- " + dateTime.toLocaleString());
    },

    setcalcactionResult: function setcalcactionResult(resultAction) {
        console.log(JSON.stringify(resultAction));
    },

    setnewexpirytoasset: function setnewexpirytoasset(assetId, expiryList) {
        io.emit("TradeAsset", { type: "TRADE_ASSET.UPDATE_EXPIRY-TIME", payload: { assetId: assetId, expiries: expiryList } });
        console.log("assetId: " + JSON.stringify(assetId));
        console.log("expiryList: " + JSON.stringify(expiryList));
    },

    updatetradesatexpiry: function updatetradesatexpiry() {
        io.emit("TradeAsset", { type: "TRADE_ASSET.SHOULD-UPDATE" });
        console.log("should update trades");
    },

    updateassetactivestatus: function updateassetactivestatus(assetId, isActive) {
        io.emit("TradeAsset", { type: "TRADE_ASSET.ACTIVE-STATUS", payload: { assetId: assetId, active: isActive } });
        console.log("assetId: " + JSON.stringify(assetId));
        console.log("isActive: " + JSON.stringify(isActive));
    }
};

client.serviceHandlers.onUnauthorized = function (res) {
    //Do your Login Request
    var location = res.headers.location;
    var result = http.get(location, function (loginResult) {
        //Copy "set-cookie" to "client.header.cookie" for future requests
        client.headers.cookie = loginResult.headers['set-cookie'];
    });
};

client.serviceHandlers = {
    bound: function bound() {
        console.log("Websocket bound");
        connectBalanceHub(signalRConfig.token);
    },
    connectFailed: function connectFailed(error) {
        console.log("Websocket connectFailed: ", error);
    },

    connected: function connected(connection) {
        /* connection: this is the connection raised from websocket */
        console.log("Server connected", connection);
        connectBalanceHub(signalRConfig.token);
    },

    disconnected: function disconnected() {
        // console.log("Websocket disconnected");
        io.emit(userId, { type: "ENGINE_DISCONNECTED", "payload": "" });
    },

    onerror: function onerror(error) {
        console.log("Websocket onerror: ", error);
    },

    bindingError: function bindingError(error) {
        console.log("Websocket bindingError: ", error);
    },

    connectionLost: function connectionLost(error) {
        // console.log("Connection Lost: ", error);
        io.emit(userId, { type: "ENGINE_DISCONNECTED", "payload": "" });
    },

    messageReceived: function messageReceived(message) {
        // console.log("Websocket messageReceived: ", message);
        return false; // { return true /* if handled */}
    },

    reconnecting: function reconnecting(retry /* { inital: true/false, count: 0} */) {
        console.log("Websocket Retrying: ", retry);
        //return retry.count >= 3; /* cancel retry true */
        return true;
    }
};

var assetsDescription = {};

_redisClient.redisClient.get("AssetsDescription", function (err, reply) {
    var assets = JSON.parse(reply);
    assets.map(function (asset) {
        assetsDescription[asset.id] = asset;
    });
    console.log("-----");
    console.log(JSON.stringify(assetsDescription));
});

var connectPacketHub = function connectPacketHub(token) {
    client.call('packethub', // Hub Name (case insensitive)
    'OnConnectedMobile', // Method Name (case insensitive)
    token //additional parameters to match signature
    ).done(function (err, result) {
        if (!err) {
            if (result) {
                console.log("connected to packet hub", result);
            } else {
                console.log("failed connecting to packet hub - user not authenticated", result);
            }
        }
    });
};

var connectBalanceHub = function connectBalanceHub(token) {
    client.call('balancehub', // Hub Name (case insensitive)
    'OnConnectedMobile', // Method Name (case insensitive)
    token //additional parameters to match signature
    ).done(function (err, result) {
        if (!err) {
            if (result) {
                console.log("connected to balance hub", result, token);
            } else {
                console.log("failed connecting to balance hub - user not authenticated", token);
            }
        }
    });
};