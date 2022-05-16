"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractName = void 0;
var TOKENS_ADDRESS_TESTNET = {
    usdt: "usdt.fakes.testnet",
    wnear: "wrap.testnet"
};
var TOKENS_ADDRESS_MAINNET = {};
function getContractName(env, tokenName) {
    var tokens;
    if (env == "mainnet") {
        tokens = TOKENS_ADDRESS_MAINNET;
    }
    else if (env == "testnet") {
        tokens = TOKENS_ADDRESS_TESTNET;
    }
    else {
        throw new Error("Environment " + env + " not found in tokens");
    }
    if (tokenName in tokens) {
        // @ts-ignore
        return tokens[tokenName];
    }
    throw new Error("Token " + tokenName + " not found in " + env);
}
exports.getContractName = getContractName;
