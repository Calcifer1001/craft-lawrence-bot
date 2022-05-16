const FARM_ID_TESTNET = {
    stable: 1,
    unstable: 2
}

const FARM_ID_MAINNET = {

}

export function getFarmIdName(env: string, farmType: string) {
    let farms
    if(env == "mainnet") {
        farms = FARM_ID_MAINNET
    } else if(env == "testnet") {
        farms = FARM_ID_TESTNET
    } else {
        throw new Error(`Environment ${env} not found in farms`)
    }
    if(farmType in farms) {
        // @ts-ignore
        return farms[farmType]
    }
    throw new Error(`Farm ${farmType} not found in ${env}`)
}