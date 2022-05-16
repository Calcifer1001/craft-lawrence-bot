import { BN } from "bn.js";
import { Account, connect, ConnectConfig, Near } from "near-api-js";

// const provider = new providers.JsonRpcProvider("https://rpc.testnet.near.org");

export class Operator {

    envConfig: ConnectConfig
    accountId: any
    near: Near|null = null
    account: Account|null = null

    constructor(env: ConnectConfig, accountId: string) {
        this.envConfig = env
        this.accountId = accountId
    }

    async init() {
        this.near = await connect(this.envConfig)
        this.account = await this.near.account(this.accountId)
    }

    async view(contract: string, method: string, args: any): Promise<any> {    
        if(this.account == null) await this.init()
        // const a = process.argv[2]
        return await this.account!.viewFunction(
            contract,
            method,
            args,            
        )
    }

    async call(contract: string, method: string, args: any, deposit: string = "1"): Promise<any> {
        if(this.account == null) await this.init()
        return this.account!.functionCall(
            contract,
            method,
            args,
            new BN(300000000000000),
            new BN(deposit)
        )
    }   
}