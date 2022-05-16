"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolIdName = void 0;
var POOL_ID_TESTNET = {
    stable: 1,
    unstable: 2
};
var POOL_ID_MAINNET = {};
function getPoolIdName(env, poolType) {
    var pools;
    if (env == "mainnet") {
        pools = POOL_ID_MAINNET;
    }
    else if (env == "testnet") {
        pools = POOL_ID_TESTNET;
    }
    else {
        throw new Error("Environment " + env + " not found in pools");
    }
    if (poolType in pools) {
        // @ts-ignore
        return pools[poolType];
    }
    throw new Error("Pool " + poolType + " not found in " + env);
}
exports.getPoolIdName = getPoolIdName;
