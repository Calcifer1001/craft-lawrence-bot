import { ConnectConfig, keyStores, Near } from "near-api-js";
import { KeyStore } from "near-api-js/lib/key_stores"

const path = require("path");
const homedir = require("os").homedir();

const credentialsPath = path.join(homedir, ".near-credentials");
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

export const TESTNET: ConnectConfig = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    keyStore,
    headers: {}
}

