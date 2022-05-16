"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFarmIdName = void 0;
var FARM_ID_TESTNET = {
    stable: 1,
    unstable: 2
};
var FARM_ID_MAINNET = {};
function getFarmIdName(env, farmType) {
    var farms;
    if (env == "mainnet") {
        farms = FARM_ID_MAINNET;
    }
    else if (env == "testnet") {
        farms = FARM_ID_TESTNET;
    }
    else {
        throw new Error("Environment " + env + " not found in farms");
    }
    if (farmType in farms) {
        // @ts-ignore
        return farms[farmType];
    }
    throw new Error("Farm " + farmType + " not found in " + env);
}
exports.getFarmIdName = getFarmIdName;
