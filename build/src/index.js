"use strict";
var fs = require("fs");
var config = require("./js/contractsConfig.js");
var tokenToFind = "wNear";
var prices = JSON.parse(fs.readFileSync("data/prices.json"));
var percentage = -1;
for (var i = 0; i < prices.length; i++) {
    if (tokenToFind.toLowerCase() == prices[i].symbol.toLowerCase()) {
        percentage = getPercentage(prices[i].price);
        break;
    }
}
var actions = [];
console.log("P:", percentage);
if (percentage == -1) {
    throw Error("Error retrieving percentage");
}
else if (0 < percentage && percentage < 0.25) {
    console.log("Executing buy");
    actions = buyActions();
}
else if (0.75 < percentage && percentage < 1) {
    console.log("Executing sell");
    actions = sellActions();
}
else if (percentage < 0 || percentage > 1) {
    console.log("Reporting possible error");
    // Report
}
else {
    console.log("No action");
}
fs.writeFileSync("actions.sh", "near view token-v3.cheddar.testnet ft_metadata > data/metadata.json");
function daysSinceStart() {
    var fechaInicio = new Date('2022-01-01').getTime();
    var fechaFin = new Date().getTime();
    var diff = fechaFin - fechaInicio;
    return diff / (1000 * 60 * 60 * 24);
}
function minValue() {
    return 0.001 * daysSinceStart() + 10;
}
function maxValue() {
    return 0.001 * daysSinceStart() + 24;
}
function getPercentage(wNearPrice) {
    var min = minValue();
    var max = maxValue();
    console.log(min);
    console.log(max);
    return (wNearPrice - min) / (max - min);
}
function buyActions() {
    var actions = [];
    var STABLE_POOL_DECIMALS = 18;
    var poolId = config.USDT_USDC_DAI;
    var exitFarmData = generateExitStableFarmData(poolId, STABLE_POOL_DECIMALS);
    var withdrawAction = exitFarmData.action;
    console.log("withdrawAction:", withdrawAction);
    var stableSharesData = fs.readFileSync("data/stable_shares.txt");
    var _a = cleanPoolInfo(stableSharesData), amounts = _a.amounts, sharesTotalSupply = _a.sharesTotalSupply;
    // const regex = "/amounts:/"
    // console.e
    // const stableShares = getJson(f)
    var lpSharesToRemove = exitFarmData.relevantData.lpSharesToRemoveBN;
    var totalShares = BigInt(sharesTotalSupply);
    console.log("Amounts", amounts);
    var minAmountsArray = amounts.map(function (amount) {
        return "\"" + getMinAmount(amount, lpSharesToRemove, totalShares).toString() + "\"";
    });
    var minAmounts = "[ " + minAmountsArray.join(", ") + " ]";
    console.log("Min amounts:", minAmounts);
    var a = removeLiquidity(poolId, lpSharesToRemove, minAmounts);
    console.log("Remove Liquidity:", a);
}
function generateExitStableFarmData(poolId, decimals) {
    // const poolId = config.USDT_USDC_DAI
    var userRefFarmsDataFile = fs.readFileSync("data/ref_farms.txt");
    var userFarms = getJson(userRefFarmsDataFile);
    var stableLpAmount = userFarms["v2.ref-finance.near@" + poolId];
    var totalShares = bigIntToNumber(stableLpAmount, decimals);
    var percentageOfPool = getPercentageToMove(1 - percentage);
    var lpSharesToRemove = totalShares * percentageOfPool;
    var lpSharesToRemoveBN = numberToBigInt(lpSharesToRemove, decimals);
    console.log("Total shares", percentageOfPool);
    console.log("Total shares", totalShares);
    console.log("Shares to remove", lpSharesToRemove);
    return {
        action: withdraw(poolId, lpSharesToRemoveBN),
        relevantData: {
            lpSharesToRemoveBN: lpSharesToRemoveBN,
            totalShares: stableLpAmount
        }
    };
}
function cleanPoolInfo(poolInfo) {
    poolInfo = poolInfo.toString("utf8").replace(/(\r\n|\n|\r|\s)/gm, "");
    var partialAmounts = poolInfo.split("amounts:")[1].split("total_fee")[0];
    console.log("Partial: ", poolInfo);
    partialAmounts = partialAmounts.substring(1, partialAmounts.length - 2).replace(/'/gm, "");
    var amounts = partialAmounts.split(",");
    var sharesTotalSupply = poolInfo.split("shares_total_supply:")[1].split(",")[0].replace(/'/gm, "");
    return {
        amounts: amounts,
        sharesTotalSupply: sharesTotalSupply
    };
}
function sellActions() {
}
function bigIntToNumber(amount, decimals) {
    return Number((BigInt(amount) * BigInt(Math.pow(10, 6)) / BigInt(Math.pow(10, decimals))).toString()) / (Math.pow(10, 6));
}
function numberToBigInt(amount, decimals) {
    var amountAux = (amount * (Math.pow(10, 6))).toString().split(".")[0];
    return BigInt(amountAux) * BigInt(Math.pow(10, decimals)) / BigInt(Math.pow(10, 6));
}
function getPercentageToMove(percentage) {
    return Math.pow(percentage, 8) / 4;
}
function withdraw(seed_id, amount) {
    var action = "near call ";
    action += config.ADDRESS_REF_FARMING;
    action += " withdraw_seed";
    action += " '{";
    action += "\"seed_id\":\"" + config.ADDRESS_REF_FARMING + "@" + seed_id + "\",";
    action += "\"amount\":\"" + amount.toString() + "\",";
    action += "\"msg\":\"\"";
    action += "}'";
    action += " --gas 200000000000000";
    action += " --depositYocto 1";
    return action;
}
function removeLiquidity(seed_id, shares, minAmounts) {
    var action = "near call ";
    action += config.ADDRESS_REF_EXCHANGE;
    action += " remove_liquidity";
    action += " '{";
    action += "\"pool_id\":\"" + seed_id + "\",";
    action += "\"shares\":\"" + shares.toString() + "\",";
    action += "\"min_amounts\":" + minAmounts;
    action += "}'";
    action += " --gas 200000000000000";
    action += " --depositYocto 1";
    return action;
}
function getJson(file) {
    var properJson = file.toString('utf8').replace(/\'/g, "\"").replace(/(\r\n|\n|\r)/gm, "");
    return JSON.parse(properJson);
}
function getMinAmount(amount, userSharesToRemove, totalShares) {
    var exactAmount = (BigInt(amount) * BigInt(userSharesToRemove) / BigInt(totalShares)).toString().split(".")[0];
    return BigInt(exactAmount) * BigInt("999") / BigInt("1000");
}
