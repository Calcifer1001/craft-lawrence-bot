import { TESTNET } from "./data/config";
import { getContractName } from "./data/tokens";
import { PriceHandler } from "./js/PriceHandler";
import { CraftLawrence } from "./strategies/CraftLawrence";
import { NEP141Operator } from "./wallet/NEP141";
import { RefOperator } from "./wallet/refOperations";

// const env = "testnet"
const ENV = TESTNET
const accountId = 'silkking.testnet'

const refOperator: RefOperator = new RefOperator(ENV, accountId)
const usdtContract = getContractName(ENV.networkId, "usdt")
const wnearContract = getContractName(ENV.networkId, "wnear")

const tokensContract = [usdtContract, wnearContract]

run()

async function run() {
    const craftLawrence = new CraftLawrence(ENV, accountId)
    const out = await craftLawrence.execute()
}

