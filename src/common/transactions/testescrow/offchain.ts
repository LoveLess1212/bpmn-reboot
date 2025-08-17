import blueprint from './plutus.json';
import {
  applyParamsToScript,
  BrowserWallet,
  BuiltinByteString,
  byteString,
  conStr0,
  ConStr0,
  conStr1,
  ConStr1,
  mConStr0,
  deserializeAddress,
  IFetcher,
  Integer,
  integer,
  List,
  list,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  UTxO,
  deserializeDatum, mConStr
} from "@meshsdk/core";

export const BpmnEscrowBlueprint = blueprint;

export type NodeState = ConStr0<[
  BuiltinByteString,
  ConStr0<[BuiltinByteString]> | ConStr1<[]>,
  ConStr0<[List<BuiltinByteString>]> | ConStr1<[]>
]>
export type ActiveEscrow = ConStr1<[
  BuiltinByteString,
  BuiltinByteString,
  Integer,
  NodeState,
  BuiltinByteString
]>
export type InitEscrow = ConStr0<[
  BuiltinByteString,
  Integer,
  NodeState,
  BuiltinByteString
]>
export const getNodeState = (
  current: string,
  incoming?: string,
  outgoing?: string[]
): NodeState => {
  if (incoming && outgoing) { // if both incoming and outgoing are present
    return conStr0([
      byteString(current),
      conStr0([byteString(incoming)]),
      conStr0([list(outgoing.map(byteString))])
    ])
  } else if (incoming) { // if only incoming is present
    return conStr0([
      byteString(current),
      conStr0([byteString(incoming)]),
      conStr1([])
    ])
  }
  return conStr0([
    byteString(current),
    conStr1([]),
    conStr0([list(outgoing.map(byteString))])
  ])
};
export const initEscrow = (
  seller: any,
  price: number,
  current: string,
  hashBpmn: string,
  incoming?: string,
  outgoing?: string[],
): InitEscrow => {
  const { pubKeyHash: sellerPubKeyHash } = deserializeAddress(seller);
  return conStr0([
    byteString(sellerPubKeyHash),
    integer(price),
    getNodeState(current, incoming, outgoing),
    byteString(hashBpmn)
  ])
};
export const initEscrow2activeEscrow = (buyer: string, initDatum: InitEscrow): ActiveEscrow => {
  const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(buyer);
  const [seller, price, nodeState, hashBpmn] = initDatum.fields;
  return conStr1([
    byteString(buyerPubKeyHash),
    seller,
    price,
    nodeState,
    hashBpmn
  ])
};
export const activeEscrow = (
  buyer: any,
  seller: any,
  price: number,
  current: string,
  hashBpmn: string,
  incoming?: string,
  outgoing?: string[],
): ActiveEscrow => {
  const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(buyer);
  const { pubKeyHash: sellerPubKeyHash } = deserializeAddress(seller);
  return conStr1([
    byteString(buyerPubKeyHash),
    byteString(sellerPubKeyHash),
    integer(price),
    getNodeState(current, incoming, outgoing),
    byteString(hashBpmn)
  ])
};

export class BpmnEscrowContract {
  private mesh: MeshTxBuilder;
  private wallet: BrowserWallet | MeshWallet;
  private networkId = 0;
  private fetcher: IFetcher;
  constructor({ mesh, fetcher, wallet, networkId = 0 }) {
    this.mesh = mesh;
    this.fetcher = fetcher;
    this.wallet = wallet;
    this.networkId = networkId;
    if (networkId === 1) {
      this.mesh.setNetwork("mainnet");
    } else {
      this.mesh.setNetwork("preprod");
    }
  }
  getScriptCbor = () => {
    let script = BpmnEscrowBlueprint.validators[0]!.compiledCode;
    return applyParamsToScript(script, []);
  };
  getWalletInfoForTx = async () => {
    let utxos = await this.wallet.getUtxos();
    let walletAddress = await this.wallet.getChangeAddress();
    let collateralRaw = await this.wallet.getCollateral();
    let collateral = collateralRaw ? collateralRaw[0] : undefined;
    return { utxos, walletAddress, collateral };
  };
  sellerListing = async (
    current: string, price: number, hashBpmn: string, outgoing: string[]
  ): Promise<string> => {
    const { utxos, walletAddress } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: "V3" },
      undefined,
      this.networkId);
    await this.mesh
      .txOut(scriptAddr, [])
      .txOutInlineDatumValue(
        initEscrow(walletAddress, price, current, hashBpmn, undefined, outgoing),
        "JSON"
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .complete();
    return this.mesh.txHex;
  };
  startEscrow = async (escrowUtxo: UTxO) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    console.log(utxos);
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: "V3" },
      undefined,
      this.networkId
    );
    const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(walletAddress);
    const inputDatum = deserializeDatum<InitEscrow>(escrowUtxo.output.plutusData!);
    const outputDatum = initEscrow2activeEscrow(walletAddress, inputDatum);
    console.log(mConStr0([buyerPubKeyHash]));
    console.log(inputDatum);
    console.log(outputDatum);
    await this.mesh
      .spendingPlutusScriptV3()
      .txIn(
        escrowUtxo.input.txHash,
        escrowUtxo.input.outputIndex,
        escrowUtxo.output.amount,
        scriptAddr,
      )
      .spendingReferenceTxInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([buyerPubKeyHash]), "Mesh") // equal to Start(buyer) in aiken
      .txInScript(this.getScriptCbor())
      .txOut(scriptAddr, [])
      .txOutInlineDatumValue(outputDatum, "JSON")
      .changeAddress(walletAddress)
      .requiredSignerHash(buyerPubKeyHash)
      .txInCollateral(
        collateral!.input.txHash,
        collateral!.input.outputIndex,
        collateral!.output.amount,
        collateral!.output.address
      )
      .selectUtxosFrom(utxos)
      .complete();
    return this.mesh.txHex;
  };
  runTask = (nodestate: NodeState) => {
    
  }
  finalizeBpmn = () => {

  }
  cancelBpmn = () => {

  }
  getUtxobyHash = async (hash: string): Promise<UTxO | undefined> => {
    if (this.fetcher) {
      console.log(hash);
      const utxos = await this.fetcher?.fetchUTxOs(hash);
      console.log(utxos);
      return utxos[0];
    }
  }

}



