const TOKENS_ADDRESS_TESTNET = {
    usdt: "usdt.fakes.testnet",
    wnear: "wrap.testnet"
}

const TOKENS_ADDRESS_MAINNET = {

}

export function getContractName(env: string, tokenName: string) {
    let tokens
    if(env == "mainnet") {
        tokens = TOKENS_ADDRESS_MAINNET
    } else if(env == "testnet") {
        tokens = TOKENS_ADDRESS_TESTNET
    } else {
        throw new Error(`Environment ${env} not found in tokens`)
    }
    if(tokenName in tokens) {
        // @ts-ignore
        return tokens[tokenName]
    }
    throw new Error(`Token ${tokenName} not found in ${env}`)
}