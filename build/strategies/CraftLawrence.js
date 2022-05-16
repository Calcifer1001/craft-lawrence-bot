"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftLawrence = void 0;
var ethers_1 = require("ethers");
var refConfig_1 = require("../data/refConfig");
var PriceHandler_1 = require("../js/PriceHandler");
var NEP141_1 = require("../wallet/NEP141");
var refOperations_1 = require("../wallet/refOperations");
var fs = require("fs");
var CraftLawrence = /** @class */ (function () {
    function CraftLawrence(env, accountId) {
        this.refOperator = null;
        this.env = env;
        this.accountId = accountId;
        this.refConfig = refConfig_1.getRefConfig(this.env.networkId);
    }
    CraftLawrence.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.refOperator = new refOperations_1.RefOperator(this.env, this.accountId);
                this.refOperator.init();
                return [2 /*return*/];
            });
        });
    };
    CraftLawrence.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var percentage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.refOperator == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.getPercentage()];
                    case 3:
                        percentage = _a.sent();
                        if (!(percentage < 0.25)) return [3 /*break*/, 5];
                        // buy
                        return [4 /*yield*/, this.buy(percentage)];
                    case 4:
                        // buy
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (percentage > 0.75) {
                            // sell
                        }
                        else {
                            console.log("No action needed");
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CraftLawrence.prototype.minPrice = function () {
        return 6;
    };
    CraftLawrence.prototype.maxPrice = function () {
        return 20;
    };
    CraftLawrence.prototype.getPercentage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nearPrice, minPrice, maxPrice, percentage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PriceHandler_1.PriceHandler.getPrice("wnear")];
                    case 1:
                        nearPrice = _a.sent();
                        minPrice = this.minPrice();
                        maxPrice = this.maxPrice();
                        percentage = (Number(nearPrice) - minPrice) / (maxPrice - minPrice);
                        if (percentage < 0)
                            return [2 /*return*/, 0];
                        if (percentage > 100)
                            return [2 /*return*/, 100];
                        return [2 /*return*/, percentage];
                }
            });
        });
    };
    CraftLawrence.prototype.getPercentageToMove = function (percentage) {
        return Math.pow(percentage, 8) / 4;
    };
    CraftLawrence.prototype.getShares = function (poolId) {
        return __awaiter(this, void 0, void 0, function () {
            var lpFarmShares, lpPoolShares;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.refOperator.getLpSharesInFarm(poolId)];
                    case 1:
                        lpFarmShares = _a.sent();
                        return [4 /*yield*/, this.refOperator.getLpSharesInPool(poolId)];
                    case 2:
                        lpPoolShares = _a.sent();
                        return [2 /*return*/, {
                                farmShares: ethers_1.BigNumber.from(lpFarmShares),
                                poolShares: ethers_1.BigNumber.from(lpPoolShares)
                            }];
                }
            });
        });
    };
    CraftLawrence.prototype.calculatePercentageOfShares = function (percentage, totalShares) {
        var mul = 10000;
        var percentageMod = ethers_1.BigNumber.from((percentage * mul).toFixed(0));
        return totalShares.mul(percentageMod).div(ethers_1.BigNumber.from(mul));
    };
    CraftLawrence.prototype.buy = function (percentage) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var content, percentageToMove, _c, farmShares, poolShares, totalShares, sharesToRemove, sharesToRemoveFromFarm, stableTokens, i, tokenIn, tokenInOperator, tokenInBalance, tokenInMetadata, tokenInSymbol, wNearContract_1, wNearContract, stNearContract, wNearOperator, wNearBalance, amountToSwap, liqResult, lpBalanceInPool, err_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        content = "";
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 12, 13, 14]);
                        content += "Proceeding to buy\n";
                        console.log("Proceeding to buy");
                        percentageToMove = this.getPercentageToMove(1 - percentage);
                        content += "Percentage to move " + percentageToMove + "\n";
                        console.log("P:", percentageToMove);
                        return [4 /*yield*/, this.getShares(this.refConfig.usdtUsdcDaiPoolId)];
                    case 2:
                        _c = _d.sent(), farmShares = _c.farmShares, poolShares = _c.poolShares;
                        totalShares = farmShares.add(poolShares);
                        sharesToRemove = this.calculatePercentageOfShares(percentageToMove, totalShares);
                        sharesToRemoveFromFarm = sharesToRemove.gt(poolShares) ? sharesToRemove.sub(poolShares) : ethers_1.BigNumber.from(0);
                        if (sharesToRemoveFromFarm.gt(ethers_1.BigNumber.from(0))) {
                            // remove shares from farm
                            content += "Removing from farm " + sharesToRemoveFromFarm + "\n";
                            console.log("Removing from farm");
                            this.refOperator.unstake(this.refConfig.usdtUsdcDaiPoolId, sharesToRemoveFromFarm);
                        }
                        content += "Removing liquidity from stable " + sharesToRemove + "\n";
                        this.refOperator.removeLiquidity(this.refConfig.usdtUsdcDaiPoolId, sharesToRemove, ["0", "0", "0"], true);
                        stableTokens = this.refConfig.stableTokens;
                        i = 0;
                        _d.label = 3;
                    case 3:
                        if (!(i < stableTokens.length)) return [3 /*break*/, 7];
                        tokenIn = stableTokens[i];
                        tokenInOperator = new NEP141_1.NEP141Operator(this.env, this.accountId, tokenIn);
                        return [4 /*yield*/, tokenInOperator.getBalance()];
                    case 4:
                        tokenInBalance = _d.sent();
                        return [4 /*yield*/, tokenInOperator.getMetadata()];
                    case 5:
                        tokenInMetadata = _d.sent();
                        tokenInSymbol = tokenInMetadata.symbol.toLowerCase();
                        wNearContract_1 = this.refConfig.unstableTokens[0];
                        content += "Swapping " + tokenInBalance.toString() + " " + tokenIn + " for wNear\n";
                        console.log("Swapping " + tokenInBalance.toString() + " " + tokenIn + " for wNear");
                        // @ts-ignore
                        this.refOperator.swap(tokenIn, wNearContract_1, tokenInBalance.toString(), this.refConfig.wNearPools[tokenInSymbol]);
                        _d.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 3];
                    case 7:
                        wNearContract = this.refConfig.unstableTokens[0];
                        stNearContract = this.refConfig.unstableTokens[1];
                        wNearOperator = new NEP141_1.NEP141Operator(this.env, this.accountId, wNearContract);
                        return [4 /*yield*/, wNearOperator.getBalance()];
                    case 8:
                        wNearBalance = _d.sent();
                        amountToSwap = wNearBalance.div(ethers_1.BigNumber.from(2));
                        console.log();
                        console.log();
                        console.log();
                        console.log("Swapping " + amountToSwap + " wNear for stNear");
                        content += "Swapping " + amountToSwap + " wNear for stNear\n";
                        this.refOperator.swap(wNearContract, stNearContract, amountToSwap.toString(), this.refConfig.wNearStNearPoolId);
                        // add liquidity to wNear-stNear
                        console.log("Adding liquidity");
                        content += "Adding liquidity\n";
                        return [4 /*yield*/, this.refOperator.addLiquidity([stNearContract, wNearContract], this.refConfig.wNearStNearPoolId, [], // Next param is true so it will add all the balance
                            true)];
                    case 9:
                        liqResult = _d.sent();
                        if (liqResult.substring(0, 2) == 'er') {
                            content += liqResult.substring(2);
                            throw new Error("Error adding liquidity");
                        }
                        else {
                            content += liqResult;
                        }
                        return [4 /*yield*/, ((_a = this.refOperator) === null || _a === void 0 ? void 0 : _a.getLpSharesInPool(this.refConfig.wNearStNearPoolId))];
                    case 10:
                        lpBalanceInPool = _d.sent();
                        console.log("Adding " + lpBalanceInPool + " to the farm");
                        return [4 /*yield*/, ((_b = this.refOperator) === null || _b === void 0 ? void 0 : _b.stake(":" + this.refConfig.wNearStNearPoolId, ethers_1.BigNumber.from(lpBalanceInPool)))];
                    case 11:
                        _d.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        err_1 = _d.sent();
                        throw err_1;
                    case 13:
                        console.log();
                        console.log();
                        console.log();
                        console.log(content);
                        fs.writeFileSync("data/buy.txt", content);
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    return CraftLawrence;
}());
exports.CraftLawrence = CraftLawrence;
