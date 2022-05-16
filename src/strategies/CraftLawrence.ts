import { BigNumber } from "ethers"
import { fstat } from "fs"
import { ConnectConfig } from "near-api-js"
import { getFarmIdName } from "../data/Farms"
import { getRefConfig, RefConfig } from "../data/refConfig"
import { PriceHandler } from "../js/PriceHandler"
import { NEP141Operator } from "../wallet/NEP141"
import { RefOperator } from "../wallet/refOperations"
const fs = require("fs")

interface Shares {
    farmShares: BigNumber
    poolShares: BigNumber
}

export class CraftLawrence {

    env: ConnectConfig
    accountId: string
    refConfig: RefConfig
    refOperator: RefOperator|null = null


    constructor(env: ConnectConfig, accountId: string) {
        this.env = env
        this.accountId = accountId
        this.refConfig = getRefConfig(this.env.networkId)
    }

    async init() {
        this.refOperator = new RefOperator(this.env, this.accountId)
        this.refOperator.init()
    }

    async execute() {
        if(this.refOperator == null) await this.init()
        const percentage = await this.getPercentage()
        if(percentage < 0.25) {
            // buy
            await this.buy(percentage)
        } else if(percentage > 0.75) {
            // sell
        } else {
            console.log("No action needed")
        }
    }

    minPrice() {
        return 6
    }
    
    maxPrice() {
        return 20
    }
    
    async getPercentage() {
        const nearPrice = await PriceHandler.getPrice("wnear")
        const minPrice = this.minPrice()
        const maxPrice = this.maxPrice()

        const percentage = (Number(nearPrice) - minPrice) / (maxPrice - minPrice)
        if(percentage < 0) return 0
        if(percentage > 100) return 100
        return percentage
    }

    getPercentageToMove(percentage: number) {
        return percentage ** 8 / 4
    }

    async getShares(poolId: number): Promise<Shares> {
        const lpFarmShares = await this.refOperator!.getLpSharesInFarm(poolId)
        const lpPoolShares = await this.refOperator!.getLpSharesInPool(poolId)
        return {
            farmShares: BigNumber.from(lpFarmShares),
            poolShares: BigNumber.from(lpPoolShares)
        }
    }

    calculatePercentageOfShares(percentage: number, totalShares: BigNumber): BigNumber {
        const mul = 10000
        const percentageMod = BigNumber.from((percentage * mul).toFixed(0))
        return totalShares.mul(percentageMod).div(BigNumber.from(mul))
    }

    async buy(percentage: number) {
        let content = ""
        try {
            content += "Proceeding to buy\n"
            console.log("Proceeding to buy")
            const percentageToMove = this.getPercentageToMove(1 - percentage)
            content += `Percentage to move ${percentageToMove}\n`
            console.log("P:" , percentageToMove)
            
            const {farmShares, poolShares} = await this.getShares(this.refConfig.usdtUsdcDaiPoolId)
            const totalShares = farmShares.add(poolShares)
            const sharesToRemove = this.calculatePercentageOfShares(percentageToMove, totalShares)
            const sharesToRemoveFromFarm = sharesToRemove.gt(poolShares) ? sharesToRemove.sub(poolShares) : BigNumber.from(0)
            if(sharesToRemoveFromFarm.gt(BigNumber.from(0))) {
                // remove shares from farm
                content += `Removing from farm ${sharesToRemoveFromFarm}\n`
                console.log("Removing from farm")
                this.refOperator!.unstake(this.refConfig.usdtUsdcDaiPoolId, sharesToRemoveFromFarm)
            }
            content += `Removing liquidity from stable ${sharesToRemove}\n`
            this.refOperator!.removeLiquidity(this.refConfig.usdtUsdcDaiPoolId, sharesToRemove, ["0", "0", "0"], true)
            
            const stableTokens = this.refConfig.stableTokens
            for(let i = 0; i < stableTokens.length; i++) {
                const tokenIn = stableTokens[i]
                const tokenInOperator = new NEP141Operator(this.env, this.accountId, tokenIn)
                const tokenInBalance = await tokenInOperator.getBalance()
                const tokenInMetadata = await tokenInOperator.getMetadata()
                const tokenInSymbol: string = tokenInMetadata.symbol.toLowerCase()
                
                const wNearContract = this.refConfig.unstableTokens[0]
                content += `Swapping ${tokenInBalance.toString()} ${tokenIn} for wNear\n`
                console.log(`Swapping ${tokenInBalance.toString()} ${tokenIn} for wNear`)
                // @ts-ignore
                this.refOperator!.swap(tokenIn, wNearContract, tokenInBalance.toString(), this.refConfig.wNearPools[tokenInSymbol])
            }
            
            // swap half wNear for stNear
            const wNearContract = this.refConfig.unstableTokens[0]
            const stNearContract = this.refConfig.unstableTokens[1]
            const wNearOperator = new NEP141Operator(this.env, this.accountId, wNearContract)
            const wNearBalance = await wNearOperator.getBalance()
            const amountToSwap = wNearBalance.div(BigNumber.from(2))
            console.log()
            console.log()
            console.log()
            console.log(`Swapping ${amountToSwap} wNear for stNear`)
            content += `Swapping ${amountToSwap} wNear for stNear\n`
            this.refOperator!.swap(wNearContract, stNearContract, amountToSwap.toString(), this.refConfig.wNearStNearPoolId)

            // add liquidity to wNear-stNear
            console.log("Adding liquidity")
            content += "Adding liquidity\n"
            const liqResult = await this.refOperator!.addLiquidity(
                [stNearContract, wNearContract],
                this.refConfig.wNearStNearPoolId,
                [], // Next param is true so it will add all the balance
                true
            )
            if(liqResult.substring(0,2) == 'er') {
                content += liqResult.substring(2)
                throw new Error("Error adding liquidity")
            } else {
                content += liqResult
            }
            
            // add lp to farm
            const lpBalanceInPool = await this.refOperator?.getLpSharesInPool(this.refConfig.wNearStNearPoolId)
            console.log(`Adding ${lpBalanceInPool} to the farm`)
            await this.refOperator?.stake(`:${this.refConfig.wNearStNearPoolId}`, BigNumber.from(lpBalanceInPool))
        } catch(err) {
            throw err
        } finally {
            console.log()
            console.log()
            console.log()
            console.log(content)
            fs.writeFileSync("data/buy.txt", content)
        }
    }

}

