"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TESTNET = void 0;
var near_api_js_1 = require("near-api-js");
var path = require("path");
var homedir = require("os").homedir();
var credentialsPath = path.join(homedir, ".near-credentials");
var keyStore = new near_api_js_1.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
exports.TESTNET = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    keyStore: keyStore,
    headers: {}
};
