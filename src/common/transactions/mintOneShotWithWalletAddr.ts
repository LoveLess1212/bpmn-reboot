import {deserializeAddress, ForgeScript, NativeScript, resolveScriptHash} from "@meshsdk/core";
import {AppWallet} from "@/common/meshWallet";

const usedAddress = AppWallet.getUsedAddresses();
const appAddress = usedAddress[0];
const {pubKeyHash: keyHash} = deserializeAddress(appAddress);

export const nativeScriptMintWithWalletAddr: NativeScript = {
    type: "all",
    scripts: [
        {
            type: "sig",
            keyHash: keyHash
        }
    ]
};
const forgingScript = ForgeScript.fromNativeScript(nativeScriptMintWithWalletAddr);
export const PolicyId_TokenWithWalletAddr = resolveScriptHash(forgingScript);