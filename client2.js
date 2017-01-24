/**
 * Created by user on 09/08/2016.
 */
'use strict';

/*const express = require('express');*/

var signalR = require('signalr-client');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(3050);

var config = {
    server: "wss://trade.fairtrade.co.il/signalr",
    hubs: ['packethub'],
    hubMethod: "updatepagebynewdata",
    emitData: "orderBooks"
};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('orderBooks', function (msg) {
        io.emit('orderBooks', msg);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

var client = new signalR.client(

//signalR service URL
config.server,

// array of hubs to be supported in the connection
config.hubs, 10, /* Reconnection Timeout is optional and defaulted to 10 seconds */
false /* doNotStart is option and defaulted to false. If set to true client will not start until .start() is called */
);

client.proxy.host = "127.0.0.1";
client.proxy.port = "443";

var jsonData = {};
client.on(
// Hub Name (case insensitive)
'packethub',

// Method Name (case insensitive)
'updatepagebynewdata',

// Callback function with parameters matching call from hub
function (name, message) {
    // console.log("revc => " + name + ": " + message);
    console.log("---update quotes-- \n");
});

// hub name must be all lower case.
client.handlers.packethub = {
    // method name must be all lower case
    //		function signature should match call from hub
    updatepagebynewdata: function updatepagebynewdata(name, message) {
        //console.log("revc => " + JSON.stringify(name)  + "\n" + JSON.stringify(message));
        console.log("---update quotes-- \n");
        jsonData = {
            "name": name,
            "message": message
        };
        io.emit('orderBooks', JSON.stringify(jsonData));
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

client.serviceHandlers.connected = function (connection) {
    /* connection: this is the connection raised from websocket */
    console.log("Server connected");
};