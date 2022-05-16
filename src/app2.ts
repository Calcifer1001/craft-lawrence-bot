import { connect, ConnectedWalletAccount, keyStores, Near, WalletConnection } from "near-api-js"

async function initNear() {
    const near = new Near(config())
    const nearWalletConnection = new WalletConnection(near, null)
    // const nearConnectedWalletAccount = new ConnectedWalletAccount(nearWalletConnection, near.connection, nearWalletConnection.getAccountId())
    console.log("HOla")
    // console.log(nearWalletConnection.getAccountId())
    
}

function config() {
    return {
        headers: {},
        networkId: 'testnet',
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org'
    };
}

initNear()