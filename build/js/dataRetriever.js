"use strict";
var config = require("contractsConfig");
var http = require('http'), https = require('https');
var client = http;
function get(url) {
    if (config.ORACLE_URL.toString().indexOf("https") === 0) {
        client = https;
    }
    client.get(url, function (resp) {
        var data = '';
        // A chunk of data has been recieved.
        resp.on('data', function (chunk) {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', function () {
            resolve(data);
        });
    }).on("error", function (err) {
        reject(err);
    });
}
