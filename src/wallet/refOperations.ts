import { BigNumber } from "ethers";
import { ConnectConfig, Contract, utils } from "near-api-js";
import { getRefConfig, RefConfig } from "../data/refConfig";
import { Operator } from "./contractOperations";
import { NEP141Operator } from "./NEP141";

export class RefOperator extends Operator {

    refConfig: RefConfig

    constructor(env: ConnectConfig, accountId: string) {
        super(env, accountId)
        this.refConfig = getRefConfig(env.networkId)
    }

    async swap(tokenIn: string, tokenOut: string, amountIn: string, poolId: number) {
        try {
            if(BigNumber.from(amountIn).eq(BigNumber.from("0"))) return
            const tokenOutOperator = new NEP141Operator(this.envConfig, this.accountId, tokenOut)
            const isTokenOutRegistered = await tokenOutOperator.isAccountRegistered()
            if(!isTokenOutRegistered) {
                await tokenOutOperator.storageDeposit()
            }
            
            let args = {
                "receiver_id": this.refConfig.financeContractName,
                "amount": amountIn,
                "msg": this.getSwapMsg(
                    poolId, 
                    tokenIn,
                    tokenOut,
                    amountIn
                )
            }
            await this.call(
                tokenIn,
                "ft_transfer_call",
                args
            )
        } catch(err) {
            // @ts-ignore
            console.error(err.transaction_outcome.outcome.status)
            throw err
        }
    }

    getSwapMsg(poolId: number, tokenIn: string, tokenOut: string, amountIn: string) {
        return `{
            \"force\": 0,
            \"actions\":
                [
                    {
                        \"pool_id\":${poolId},
                        \"token_in\":\"${tokenIn}\",
                        \"token_out\":\"${tokenOut}\",
                        \"amount_in\":\"${amountIn}\",
                        \"min_amount_out\":\"0\"
                    }
                ]
        }`
    }

    async unstake(poolId: number, amount: BigNumber) {
        const isAccountRegistered = await this.isAccountRegistered(this.refConfig.farmingContractName)
        if(!isAccountRegistered) {
            await this.storageDeposit(this.refConfig.farmingContractName)
        }
        const args = {
            seed_id: `${this.refConfig.financeContractName}@${poolId}`,
            amount: amount.toString(),
            msg: ""
        }
        return this.call(
            this.refConfig.farmingContractName,
            "withdraw_seed",
            args
        )
    }

    async addLiquidity(tokens: string[], poolId: number, amounts: BigNumber[], addAll: boolean = true): Promise<string> {
        let content = ""
        try {
            for(let i = 0; i < tokens.length; i++) {
                // Register tokens
                const contract = tokens[i]
                const isAccountRegistered = await this.isAccountRegistered(contract)
                if(!isAccountRegistered) {
                    content += `Registering ${contract}\n`
                    console.log(`Registering ${contract}`)
                    await this.storageDeposit(contract)
                }

                const tokenOperator = new NEP141Operator(this.envConfig, this.accountId, contract)
                // Check if should add all balance
                if(addAll) {
                    const tokenBalance = await tokenOperator.getBalance()
                    amounts[i] = BigNumber.from(tokenBalance)
                }
                
                // Transfer amount to ref
                console.log()
                console.log()
                console.log()
                content += `Transfering ${amounts[i]} ${contract} to ref\n`
                console.log(`Transfering ${amounts[i]} ${contract} to ref`)
                await tokenOperator.transfer(this.refConfig.financeContractName, amounts[i])
            }

            // Add liquidity to ref
            let validLiquidity = true
            amounts.forEach(a => validLiquidity = validLiquidity && a.gt(BigNumber.from("0")))
            if(!validLiquidity) {
                content += "Trying to add zero liquidity. Returning\n"
                return content
            }
            const args = {
                pool_id: poolId,
                amounts: amounts.map(a => a.toString())
            }
            content += `Adding liquidity with poolId ${poolId} and amount ${amounts.map(a => a.toString()).join(" - ")}`
            await this.call(
                this.refConfig.financeContractName,
                "add_liquidity",
                args,
                "810000000000000000000"
            )
        } catch(err) {
            return `er${content}`
        }
        return content
    }

    async removeLiquidity(poolId: number, amount: BigNumber, minAmounts: string[], removeAll: boolean = false) {
        
        // Check if REF FINANCE is registered
        const isAccountRegistered = await this.isAccountRegistered(this.refConfig.financeContractName)
        if(!isAccountRegistered) {
            console.log("Registering ref finance")
            await this.storageDeposit(this.refConfig.financeContractName)
        }
        
        // Check if all tokens in pool are registered
        const pool = await this.getPool(poolId)
        for(let i = 0; i < pool.token_account_ids.length; i++) {
            const contract = pool.token_account_ids[i]
            const tokenOperator = new NEP141Operator(this.envConfig, this.account!.accountId, contract)
            const isRegistered = tokenOperator.isAccountRegistered()
            if(!isRegistered) {
                console.log(`Registering ${contract}`)
                tokenOperator.storageDeposit()
            }
        }
        
        if(removeAll) {
            const lpPoolShares = await this.getLpSharesInPool(poolId)
            amount = BigNumber.from(lpPoolShares)
        }
        if(amount.eq(BigNumber.from("0"))) return
        console.log("Amount to remove", amount.toString())
        // Remove liquidity
        const removeArgs = {
            pool_id: poolId,
            shares: amount.toString(),
            // TODO calculate min amounts
            min_amounts: [
                "0",
                "0",
                "0"
            ]
        }
        console.log("Removing liquidity")
        this.call(
            this.refConfig.financeContractName,
            "remove_liquidity",
            removeArgs
        )

        // Withdrawing these tokens from REF
        for(let i = 0; i < pool.token_account_ids.length; i++) {
            const contract = pool.token_account_ids[i]
            const withdrawAmount = await this.getBalanceOnRef(contract)
            console.log(`Withdrawing ${withdrawAmount.toString()} from ${contract}`)

            if(withdrawAmount.eq(BigNumber.from("0"))) continue
            const withdrawArgs = {
                token_id: contract,
                amount: withdrawAmount.toString(),
                unregister: false
            }
            
            await this.call(
                this.refConfig.financeContractName,
                "withdraw",
                withdrawArgs
            )
            
        }
    }

    /**
     * 
     * @param tokenId :farmId
     * @param amount 
     * @returns 
     */
    async stake(tokenId: string, amount: BigNumber) {
        if(amount.eq(BigNumber.from(0))) return
        const args = {
            receiver_id: this.refConfig.farmingContractName,
            token_id: tokenId,
            amount: amount.toString(),
            msg: ""
        }

        return await this.call(
            this.refConfig.financeContractName,
            "mft_transfer_call",
            args
        )
    }

    async getBalanceOnRef(token: string): Promise<BigNumber> {
        const args = {account_id:this.account!.accountId}
        const balances = await this.view(
            this.refConfig.financeContractName,
            "get_deposits",
            args
        )
        return BigNumber.from(balances[token] || "0")
    }

    async getPool(poolId: number) {
        return this.view(
            this.refConfig.financeContractName, 
            "get_pool",
            {pool_id: poolId}
        )
    }

    async storageBalance(contract: string) {
        return this.view(
            contract,
            "storage_balance_of",
            {"account_id": this.accountId}
        )
    }
    

    async isAccountRegistered(contract: string) {
        if(this.envConfig.networkId == "testnet") return false
        return (await this.storageBalance(contract)) != null
    }

    async storageDeposit(contract: string) {
        return this.call(
            contract,
            "storage_deposit",
            {"registration_only": false, "account_id": this.account?.accountId},
            utils.format.parseNearAmount("0.1") as string
        )
    }

    async getFarmShares(): Promise<any>{
        const args = {account_id: this.accountId}
        return this.view(this.refConfig.farmingContractName, "list_user_seeds", args)
    }

    async getLpSharesInFarm(farmId: number): Promise<string> {
        const farmShares = await this.getFarmShares()
        console.log(this.refConfig.farmingContractName)
        return farmShares[`${this.refConfig.financeContractName}@${farmId}`] || 0
    }

    async getLpSharesInPool(poolId: number): Promise<string> {
        const args = {pool_id: poolId, account_id: this.account?.accountId}
        return this.view(this.refConfig.financeContractName, "get_pool_shares", args)
    }
}