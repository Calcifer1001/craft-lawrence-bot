import { fetchJson } from "near-api-js/lib/utils/web"

export interface TokenData {
    rank: number
    symbol: string
    icon: string
    amount: string
    price: string
    volume24h: string
    tvl: string
}

export class PriceHandler {

    static url: string = "https://api.stats.ref.finance/api/top-tokens"
    static prices: TokenData[] = []

    static async setPrices() {
        PriceHandler.prices = await fetchJson(PriceHandler.url)
    }

    static async getPrice(tokenSymbol: string, refreshPrices: boolean = false): Promise<string> {
        if(refreshPrices || PriceHandler.prices.length == 0) {
            await this.setPrices()
        }
        for(let i = 0; i < PriceHandler.prices.length; i++) {
            if(PriceHandler.prices[i].symbol.toLowerCase() == tokenSymbol.toLowerCase()) {
                return PriceHandler.prices[i].price
            }
        }
        throw new Error(`Token ${tokenSymbol} not found`)
    }

}