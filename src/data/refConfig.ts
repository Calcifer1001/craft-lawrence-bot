export interface RefConfig {
    financeContractName: string
    farmingContractName: string
    wNearPools: StableWNearPools
    // usdtWnearPoolId: number
    // usdcWnearPoolId: number
    // daiWnearPoolId: number
    usdtUsdcDaiPoolId: number
    wNearStNearPoolId: number
    stableTokens: string[]
    unstableTokens: string[]
}

export interface StableWNearPools {
    usdt: number
    usdc: number
    dai: number
}

export function getRefConfig(env: string): RefConfig {
    if(env == "testnet") {
        return REF_TESTNET
    }
    throw new Error(`${env} environment is not defined in RefConfig`)
}

export const REF_TESTNET: RefConfig = {
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
}

