"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REF_TESTNET = exports.getRefConfig = void 0;
function getRefConfig(env) {
    if (env == "testnet") {
        return exports.REF_TESTNET;
    }
    throw new Error(env + " environment is not defined in RefConfig");
}
exports.getRefConfig = getRefConfig;
exports.REF_TESTNET = {
    financeContractName: "ref-finance-101.testnet",
    farmingContractName: "v2.ref-farming.testnet",
    wNearPools: {
        usdt: 34,
        usdc: 54,
        dai: 49
    },
    usdtUsdcDaiPoolId: 218,
    wNearStNearPoolId: 48,
    stableTokens: ["usdt.fakes.testnet", "usdc.fakes.testnet", "dai.fakes.testnet"],
    unstableTokens: ["wrap.testnet", "stnear.fakes.testnet"]
};
