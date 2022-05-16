import { BigNumber } from "ethers"
import { ConnectConfig, utils } from "near-api-js"
import { Operator } from "./contractOperations"

export interface Metadata {
    spec: string
    name: string
    symbol: string
    icon: string
    reference: string|null
    reference_hash: string|null
    decimals: number
}

export class NEP141Operator extends Operator {

    contract: string

    constructor(env: ConnectConfig, accountId: string, contract: string) {
        super(env, accountId)
        this.contract = contract
    }

    async getBalance(): Promise<BigNumber> {
        const balance = await this.view(
            this.contract,
            "ft_balance_of",
            {account_id: this.accountId}
        )
        return BigNumber.from(balance)
    }

    async transfer(receiverId: string, amount: BigNumber, msg: string = "") {
        if(amount.eq(BigNumber.from("0"))) return
        const args = {
            receiver_id: receiverId,
            amount: amount.toString(),
            msg
        }
        return await this.call(
            this.contract,
            "ft_transfer_call",
            args
        )
    }

    async getMetadata(): Promise<Metadata> {
        return await this.view(
            this.contract,
            "ft_metadata",
            {}
        )
    }

    async storageBalance() {
        return this.view(
            this.contract,
            "storage_balance_of",
            {account_id: this.accountId}
        )
    }

    async isAccountRegistered() {
        if(this.envConfig.networkId == "testnet") return false
        return (await this.storageBalance()) != null
    }

    async storageDeposit() {
        return this.call(
            this.contract,
            "storage_deposit",
            {"registration_only": true, "account_id": this.accountId},
            utils.format.parseNearAmount("0.1") as string
        )
    }
}