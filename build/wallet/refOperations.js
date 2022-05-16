"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.RefOperator = void 0;
var ethers_1 = require("ethers");
var near_api_js_1 = require("near-api-js");
var refConfig_1 = require("../data/refConfig");
var contractOperations_1 = require("./contractOperations");
var NEP141_1 = require("./NEP141");
var RefOperator = /** @class */ (function (_super) {
    __extends(RefOperator, _super);
    function RefOperator(env, accountId) {
        var _this = _super.call(this, env, accountId) || this;
        _this.refConfig = refConfig_1.getRefConfig(env.networkId);
        return _this;
    }
    RefOperator.prototype.swap = function (tokenIn, tokenOut, amountIn, poolId) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenOutOperator, isTokenOutRegistered, args, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (ethers_1.BigNumber.from(amountIn).eq(ethers_1.BigNumber.from("0")))
                            return [2 /*return*/];
                        tokenOutOperator = new NEP141_1.NEP141Operator(this.envConfig, this.accountId, tokenOut);
                        return [4 /*yield*/, tokenOutOperator.isAccountRegistered()];
                    case 1:
                        isTokenOutRegistered = _a.sent();
                        if (!!isTokenOutRegistered) return [3 /*break*/, 3];
                        return [4 /*yield*/, tokenOutOperator.storageDeposit()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        args = {
                            "receiver_id": this.refConfig.financeContractName,
                            "amount": amountIn,
                            "msg": this.getSwapMsg(poolId, tokenIn, tokenOut, amountIn)
                        };
                        return [4 /*yield*/, this.call(tokenIn, "ft_transfer_call", args)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        // @ts-ignore
                        console.error(err_1.transaction_outcome.outcome.status);
                        throw err_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RefOperator.prototype.getSwapMsg = function (poolId, tokenIn, tokenOut, amountIn) {
        return "{\n            \"force\": 0,\n            \"actions\":\n                [\n                    {\n                        \"pool_id\":" + poolId + ",\n                        \"token_in\":\"" + tokenIn + "\",\n                        \"token_out\":\"" + tokenOut + "\",\n                        \"amount_in\":\"" + amountIn + "\",\n                        \"min_amount_out\":\"0\"\n                    }\n                ]\n        }";
    };
    RefOperator.prototype.unstake = function (poolId, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var isAccountRegistered, args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isAccountRegistered(this.refConfig.farmingContractName)];
                    case 1:
                        isAccountRegistered = _a.sent();
                        if (!!isAccountRegistered) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.storageDeposit(this.refConfig.farmingContractName)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        args = {
                            seed_id: this.refConfig.financeContractName + "@" + poolId,
                            amount: amount.toString(),
                            msg: ""
                        };
                        return [2 /*return*/, this.call(this.refConfig.farmingContractName, "withdraw_seed", args)];
                }
            });
        });
    };
    RefOperator.prototype.addLiquidity = function (tokens, poolId, amounts, addAll) {
        if (addAll === void 0) { addAll = true; }
        return __awaiter(this, void 0, void 0, function () {
            var content, i, contract, isAccountRegistered, tokenOperator, tokenBalance, validLiquidity_1, args, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = "";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < tokens.length)) return [3 /*break*/, 10];
                        contract = tokens[i];
                        return [4 /*yield*/, this.isAccountRegistered(contract)];
                    case 3:
                        isAccountRegistered = _a.sent();
                        if (!!isAccountRegistered) return [3 /*break*/, 5];
                        content += "Registering " + contract + "\n";
                        console.log("Registering " + contract);
                        return [4 /*yield*/, this.storageDeposit(contract)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        tokenOperator = new NEP141_1.NEP141Operator(this.envConfig, this.accountId, contract);
                        if (!addAll) return [3 /*break*/, 7];
                        return [4 /*yield*/, tokenOperator.getBalance()];
                    case 6:
                        tokenBalance = _a.sent();
                        amounts[i] = ethers_1.BigNumber.from(tokenBalance);
                        _a.label = 7;
                    case 7:
                        // Transfer amount to ref
                        console.log();
                        console.log();
                        console.log();
                        content += "Transfering " + amounts[i] + " " + contract + " to ref\n";
                        console.log("Transfering " + amounts[i] + " " + contract + " to ref");
                        return [4 /*yield*/, tokenOperator.transfer(this.refConfig.financeContractName, amounts[i])];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 2];
                    case 10:
                        validLiquidity_1 = true;
                        amounts.forEach(function (a) { return validLiquidity_1 = validLiquidity_1 && a.gt(ethers_1.BigNumber.from("0")); });
                        if (!validLiquidity_1) {
                            content += "Trying to add zero liquidity. Returning\n";
                            return [2 /*return*/, content];
                        }
                        args = {
                            pool_id: poolId,
                            amounts: amounts.map(function (a) { return a.toString(); })
                        };
                        content += "Adding liquidity with poolId " + poolId + " and amount " + amounts.map(function (a) { return a.toString(); }).join(" - ");
                        return [4 /*yield*/, this.call(this.refConfig.financeContractName, "add_liquidity", args, "810000000000000000000")];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        err_2 = _a.sent();
                        return [2 /*return*/, "er" + content];
                    case 13: return [2 /*return*/, content];
                }
            });
        });
    };
    RefOperator.prototype.removeLiquidity = function (poolId, amount, minAmounts, removeAll) {
        if (removeAll === void 0) { removeAll = false; }
        return __awaiter(this, void 0, void 0, function () {
            var isAccountRegistered, pool, i, contract, tokenOperator, isRegistered, lpPoolShares, removeArgs, i, contract, withdrawAmount, withdrawArgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isAccountRegistered(this.refConfig.financeContractName)];
                    case 1:
                        isAccountRegistered = _a.sent();
                        if (!!isAccountRegistered) return [3 /*break*/, 3];
                        console.log("Registering ref finance");
                        return [4 /*yield*/, this.storageDeposit(this.refConfig.financeContractName)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.getPool(poolId)];
                    case 4:
                        pool = _a.sent();
                        for (i = 0; i < pool.token_account_ids.length; i++) {
                            contract = pool.token_account_ids[i];
                            tokenOperator = new NEP141_1.NEP141Operator(this.envConfig, this.account.accountId, contract);
                            isRegistered = tokenOperator.isAccountRegistered();
                            if (!isRegistered) {
                                console.log("Registering " + contract);
                                tokenOperator.storageDeposit();
                            }
                        }
                        if (!removeAll) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getLpSharesInPool(poolId)];
                    case 5:
                        lpPoolShares = _a.sent();
                        amount = ethers_1.BigNumber.from(lpPoolShares);
                        _a.label = 6;
                    case 6:
                        if (amount.eq(ethers_1.BigNumber.from("0")))
                            return [2 /*return*/];
                        console.log("Amount to remove", amount.toString());
                        removeArgs = {
                            pool_id: poolId,
                            shares: amount.toString(),
                            // TODO calculate min amounts
                            min_amounts: [
                                "0",
                                "0",
                                "0"
                            ]
                        };
                        console.log("Removing liquidity");
                        this.call(this.refConfig.financeContractName, "remove_liquidity", removeArgs);
                        i = 0;
                        _a.label = 7;
                    case 7:
                        if (!(i < pool.token_account_ids.length)) return [3 /*break*/, 11];
                        contract = pool.token_account_ids[i];
                        return [4 /*yield*/, this.getBalanceOnRef(contract)];
                    case 8:
                        withdrawAmount = _a.sent();
                        console.log("Withdrawing " + withdrawAmount.toString() + " from " + contract);
                        if (withdrawAmount.eq(ethers_1.BigNumber.from("0")))
                            return [3 /*break*/, 10];
                        withdrawArgs = {
                            token_id: contract,
                            amount: withdrawAmount.toString(),
                            unregister: false
                        };
                        return [4 /*yield*/, this.call(this.refConfig.financeContractName, "withdraw", withdrawArgs)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        i++;
                        return [3 /*break*/, 7];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param tokenId :farmId
     * @param amount
     * @returns
     */
    RefOperator.prototype.stake = function (tokenId, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (amount.eq(ethers_1.BigNumber.from(0)))
                            return [2 /*return*/];
                        args = {
                            receiver_id: this.refConfig.farmingContractName,
                            token_id: tokenId,
                            amount: amount.toString(),
                            msg: ""
                        };
                        return [4 /*yield*/, this.call(this.refConfig.financeContractName, "mft_transfer_call", args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RefOperator.prototype.getBalanceOnRef = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var args, balances;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = { account_id: this.account.accountId };
                        return [4 /*yield*/, this.view(this.refConfig.financeContractName, "get_deposits", args)];
                    case 1:
                        balances = _a.sent();
                        return [2 /*return*/, ethers_1.BigNumber.from(balances[token] || "0")];
                }
            });
        });
    };
    RefOperator.prototype.getPool = function (poolId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.view(this.refConfig.financeContractName, "get_pool", { pool_id: poolId })];
            });
        });
    };
    RefOperator.prototype.storageBalance = function (contract) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.view(contract, "storage_balance_of", { "account_id": this.accountId })];
            });
        });
    };
    RefOperator.prototype.isAccountRegistered = function (contract) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.envConfig.networkId == "testnet")
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.storageBalance(contract)];
                    case 1: return [2 /*return*/, (_a.sent()) != null];
                }
            });
        });
    };
    RefOperator.prototype.storageDeposit = function (contract) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, this.call(contract, "storage_deposit", { "registration_only": false, "account_id": (_a = this.account) === null || _a === void 0 ? void 0 : _a.accountId }, near_api_js_1.utils.format.parseNearAmount("0.1"))];
            });
        });
    };
    RefOperator.prototype.getFarmShares = function () {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                args = { account_id: this.accountId };
                return [2 /*return*/, this.view(this.refConfig.farmingContractName, "list_user_seeds", args)];
            });
        });
    };
    RefOperator.prototype.getLpSharesInFarm = function (farmId) {
        return __awaiter(this, void 0, void 0, function () {
            var farmShares;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFarmShares()];
                    case 1:
                        farmShares = _a.sent();
                        console.log(this.refConfig.farmingContractName);
                        return [2 /*return*/, farmShares[this.refConfig.financeContractName + "@" + farmId] || 0];
                }
            });
        });
    };
    RefOperator.prototype.getLpSharesInPool = function (poolId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_b) {
                args = { pool_id: poolId, account_id: (_a = this.account) === null || _a === void 0 ? void 0 : _a.accountId };
                return [2 /*return*/, this.view(this.refConfig.financeContractName, "get_pool_shares", args)];
            });
        });
    };
    return RefOperator;
}(contractOperations_1.Operator));
exports.RefOperator = RefOperator;
