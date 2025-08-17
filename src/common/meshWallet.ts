import {BlockchainProvider} from "@/common/Provider";
import { MeshWallet } from '@meshsdk/core';

export const AppWallet = new MeshWallet({
    networkId: 0, // 0: testnet, 1: mainnet
    fetcher: BlockchainProvider,
    submitter: BlockchainProvider,
    key: {
        type: 'mnemonic',
        words: [
            "kingdom",
            "range",
            "jar",
            "box",
            "need",
            "arch",
            "december",
            "taste",
            "office",
            "defy",
            "advance",
            "grace",
            "water",
            "purse",
            "slide",
            "obtain",
            "there",
            "sing",
            "list",
            "hen",
            "grief",
            "caution",
            "tiger",
            "people"
        ],
    },
});