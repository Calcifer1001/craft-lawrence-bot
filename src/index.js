const fs = require("fs")
const config = require("./js/contractsConfig.js")

const tokenToFind = "wNear"
const prices = JSON.parse(fs.readFileSync("data/prices.json"))
let percentage = -1

for(let i = 0; i < prices.length; i++) {
    if(tokenToFind.toLowerCase() == prices[i].symbol.toLowerCase()) {
        percentage = getPercentage(prices[i].price)
        break
    }
}

let actions = []
console.log("P:", percentage)
if(percentage == -1) {
    throw Error("Error retrieving percentage")
} else if(0 < percentage && percentage < 0.25) {
    console.log("Executing buy")
    actions = buyActions()
} else if(0.75 < percentage && percentage < 1) {
    console.log("Executing sell")
    actions = sellActions()
} else if ( percentage < 0 || percentage > 1) {
    console.log("Reporting possible error")
    // Report
} else {
    console.log("No action")
}

fs.writeFileSync("actions.sh", "near view token-v3.cheddar.testnet ft_metadata > data/metadata.json")

function daysSinceStart() {
    var fechaInicio = new Date('2022-01-01').getTime();
    var fechaFin    = new Date().getTime();

    var diff = fechaFin - fechaInicio;

    return diff/(1000*60*60*24)
}

function minValue() {
    return 0.001 * daysSinceStart() + 10
}

function maxValue() {
    return 0.001 * daysSinceStart() + 24
}

function getPercentage(wNearPrice) {
    const min = minValue()
    const max = maxValue()
    console.log(min)
    console.log(max)
    return (wNearPrice - min) / (max - min)
}

function buyActions() {
    let actions = []
    const STABLE_POOL_DECIMALS = 18
    const poolId = config.USDT_USDC_DAI

    const exitFarmData = generateExitStableFarmData(poolId, STABLE_POOL_DECIMALS)
    const withdrawAction = exitFarmData.action
    console.log("withdrawAction:", withdrawAction)

    const stableSharesData = fs.readFileSync("data/stable_shares.txt")
    const { amounts, sharesTotalSupply } = cleanPoolInfo(stableSharesData)
    
    // const regex = "/amounts:/"
    // console.e
    // const stableShares = getJson(f)
    const lpSharesToRemove = exitFarmData.relevantData.lpSharesToRemoveBN
    const totalShares = BigInt(sharesTotalSupply)
    console.log("Amounts", amounts)
    const minAmountsArray = amounts.map(amount => {
        return `"${getMinAmount(amount, lpSharesToRemove, totalShares).toString()}"`
    })
    const minAmounts = `[ ${minAmountsArray.join(", ")} ]`
    console.log("Min amounts:", minAmounts)

    const a = removeLiquidity(poolId, lpSharesToRemove, minAmounts)
    console.log("Remove Liquidity:", a)
    
}

function generateExitStableFarmData(poolId, decimals) {
    // const poolId = config.USDT_USDC_DAI
    const userRefFarmsDataFile = fs.readFileSync("data/ref_farms.txt")
    const userFarms = getJson(userRefFarmsDataFile)
    
    const stableLpAmount = userFarms[`v2.ref-finance.near@${poolId}`]
    const totalShares = bigIntToNumber(stableLpAmount, decimals)
    
    const percentageOfPool = getPercentageToMove(1 - percentage)
    const lpSharesToRemove = totalShares * percentageOfPool
    const lpSharesToRemoveBN = numberToBigInt(lpSharesToRemove, decimals)
    console.log("Total shares", percentageOfPool)
    console.log("Total shares", totalShares)
    console.log("Shares to remove", lpSharesToRemove)

    return {
        action: withdraw(poolId, lpSharesToRemoveBN),
        relevantData: {
            lpSharesToRemoveBN,
            totalShares: stableLpAmount
        }
    }
}

function cleanPoolInfo(poolInfo) {
    poolInfo = poolInfo.toString("utf8").replace(/(\r\n|\n|\r|\s)/gm, "")

    let partialAmounts = poolInfo.split("amounts:")[1].split("total_fee")[0]
    console.log("Partial: ", poolInfo)
    partialAmounts = partialAmounts.substring(1, partialAmounts.length - 2).replace(/'/gm, "")
    let amounts = partialAmounts.split(",")

    let sharesTotalSupply = poolInfo.split("shares_total_supply:")[1].split(",")[0].replace(/'/gm, "")
    return {
        amounts,
        sharesTotalSupply
    }
}

function sellActions() {
        
}

function bigIntToNumber(amount, decimals) {
    return Number((BigInt(amount) * BigInt(10 ** 6) / BigInt(10 ** decimals)).toString()) / (10**6)
}

function numberToBigInt(amount, decimals) {
    const amountAux = (amount * (10**6)).toString().split(".")[0]
    return BigInt(amountAux) * BigInt(10 ** decimals) / BigInt(10**6)
}

function getPercentageToMove(percentage) {
    return percentage ** 8 / 4
}

function withdraw(seed_id, amount) {
    let action = "near call "
    action += config.ADDRESS_REF_FARMING
    action += " withdraw_seed"
    action += " '{"
    action += `"seed_id":"${config.ADDRESS_REF_FARMING}@${seed_id}",`
    action += `"amount":"${amount.toString()}",`
    action += `"msg":""`
    action += "}'"
    action += " --gas 200000000000000"
    action += " --depositYocto 1"
    return action
}

function removeLiquidity(seed_id, shares, minAmounts) {
    let action = "near call "
    action += config.ADDRESS_REF_EXCHANGE
    action += " remove_liquidity"

    action += " '{"
    action += `"pool_id":"${seed_id}",`
    action += `"shares":"${shares.toString()}",`
    action += `"min_amounts":${minAmounts}`
    action += "}'"

    action += " --gas 200000000000000"
    action += " --depositYocto 1"
    return action
}

function getJson(file) {
    const properJson = file.toString('utf8').replace(/\'/g,"\"").replace(/(\r\n|\n|\r)/gm,"")
    return JSON.parse(properJson)
}

function getMinAmount(amount, userSharesToRemove, totalShares) {
    const exactAmount = (BigInt(amount) * BigInt(userSharesToRemove) / BigInt(totalShares)).toString().split(".")[0]
    return BigInt(exactAmount) * BigInt("999") / BigInt("1000")
}