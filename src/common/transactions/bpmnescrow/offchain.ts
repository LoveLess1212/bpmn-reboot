import blueprint from './plutus.json';
import {
  applyParamsToScript,
  BrowserWallet,
  BuiltinByteString,
  byteString,
  conStr,
  conStr0,
  ConStr0,
  conStr1,
  ConStr1,
  mConStr0,
  mConStr1,
  MeshValue,
  deserializeAddress,
  IFetcher,
  integer,
  list,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  UTxO,
  deserializeDatum, mConStr,
  mConStr2,
  serializeAddressObj,
  PubKeyAddress,
  ByteString
} from "@meshsdk/core";
import { ActiveEscrow, InitEscrow, NodeState } from './types';
import { initEscrow, initEscrow2activeEscrow, activeEscrow, updateDatum } from './helper';

export const BpmnEscrowBlueprint = blueprint;
/**
 * A class that handles BPMN-based escrow contract operations on the Cardano blockchain.
 * @class
 */
export class BpmnEscrowContract {
  private mesh: MeshTxBuilder;
  private wallet: BrowserWallet | MeshWallet;
  private networkId = 0;
  private fetcher: IFetcher;
  private proceedPerTask = 2000000;
  private BodyTx;
  /**
 * Creates an instance of BpmnEscrowContract.
 * @param {Object} params - The constructor parameters
 * @param {MeshTxBuilder} params.mesh - The Mesh transaction builder instance
 * @param {IFetcher} params.fetcher - The fetcher interface for UTxO operations
 * @param {BrowserWallet | MeshWallet} params.wallet - The wallet instance
 * @param {number} [params.networkId=0] - The network ID (0 for preprod, 1 for mainnet)
 * @param {number} [params.proceedPerTask=2000000] - The proceed amount per task in lovelace
 */

  constructor({ mesh, fetcher, wallet, networkId = 0, proceedPerTask = 2000000 }) {
    this.mesh = mesh;
    this.fetcher = fetcher;
    this.wallet = wallet;
    this.networkId = networkId;
    if (networkId === 1) {
      this.mesh.setNetwork("mainnet");
    } else {
      this.mesh.setNetwork("preprod");
    }
    this.proceedPerTask = proceedPerTask
  }

  /**
 * Creates a seller listing transaction.
 * @param {string} current - The current state identifier
 * @param {number} price - The price in lovelace
 * @param {string} hashBpmn - The hash of the BPMN process
 * @param {string[]} outgoing - Array of outgoing state identifiers
 * @returns {Promise<string>} The transaction hex
 */
  sellerListing = async (
    current: string, price: number, hashBpmn: string, outgoing: string[]
  ): Promise<string> => {

    const { utxos, walletAddress } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: "V3" },
      undefined,
      this.networkId);
    const proceed = [
      {
        unit: "lovelace",
        quantity: this.proceedPerTask.toString()
      }
    ];
    await this.mesh
      .txOut(scriptAddr, proceed)
      .txOutInlineDatumValue(
        initEscrow(walletAddress, price, current, hashBpmn, null, outgoing),
        "JSON"
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .complete();
    return this.mesh.txHex;
  };

  /**
   * Initiates the escrow process by the buyer.
   * @param {UTxO} escrowUtxo - The UTxO containing the escrow information
   * @returns {Promise<string>} The transaction hex
   */

  startEscrow = async (escrowUtxo: UTxO): Promise<string> => {
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
    // console.log(mConStr0([buyerPubKeyHash]));
    const price = inputDatum.fields[1].int as number;
    const depositValue = [
      {
        unit: "lovelace",
        quantity: (Math.ceil(price) + this.proceedPerTask).toString()
      }
    ];
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
      .txOut(scriptAddr, depositValue)
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

  /**
   * Executes a task in the BPMN process.
   * @param {UTxO} oldUtxo - The current UTxO state
   * @param {NodeState} nodeState - The new state to transition to
   * @returns {Promise<string>} The transaction hex
   */

  runTask = async (oldUtxo: UTxO, nodeState: NodeState): Promise<string> => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: "V3" },
      undefined,
      this.networkId
    );
    const inputDatum = deserializeDatum<ActiveEscrow>(oldUtxo.output.plutusData!);
    // console.log(inputDatum);
    const outputDatum = updateDatum(inputDatum, nodeState, this.proceedPerTask);
    // console.log(outputDatum);
    const { buyer: buyer, seller: seller } = this.getDataFromActiveEscrowDatum(oldUtxo);
    // get the old amount of script then + proceed
    const inputLoveLaceFromSCript = oldUtxo.output.amount.find((a) => a.unit === "lovelace")!.quantity;
    // console.log(inputLoveLaceFromSCript);
    const proceed = [
      {
        unit: "lovelace",
        quantity: (parseInt(inputLoveLaceFromSCript) + this.proceedPerTask).toString()
      }
    ];
    await this.mesh
      .spendingPlutusScriptV3()
      .txIn(
        oldUtxo.input.txHash,
        oldUtxo.input.outputIndex,
        oldUtxo.output.amount,
        scriptAddr,
      )
      .spendingReferenceTxInInlineDatumPresent()
      .txInRedeemerValue(conStr1([nodeState]), "JSON") // equal to Task(new_task) in aiken
      .txInScript(this.getScriptCbor())
      .txOut(scriptAddr, proceed)
      .txOutInlineDatumValue(outputDatum, "JSON")
      .txInCollateral(
        collateral!.input.txHash,
        collateral!.input.outputIndex,
        collateral!.output.amount,
        collateral!.output.address
      )
      .selectUtxosFrom(utxos, undefined, undefined, true)
      .requiredSignerHash(buyer)
      .requiredSignerHash(seller)
      .changeAddress(walletAddress)
      .complete();
    return this.mesh.txHex;
  };

  /**
   * Finalizes the BPMN process and releases funds to the seller.
   * @param {UTxO} oldUtxo - The current UTxO state
   * @returns {Promise<string>} The transaction hex
   */
  finalizeBpmn = async (oldUtxo: UTxO): Promise<string> => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: "V3" },
      undefined,
      this.networkId
    );
    // console.log(oldUtxo);
    // const inputDatum = deserializeDatum<ActiveEscrow>(oldUtxo.output.plutusData!);
    // console.log(inputDatum);
    const { buyer: buyerAddress, seller: sellerAddress, price: price, proceed: proceed } = this.getDataFromActiveEscrowDatum(oldUtxo);
    const sellerReceiveAddr = this.getAddressfromPubKeyHash(byteString(sellerAddress));
    const sellerReceive = [
      {
        unit: "lovelace",
        quantity: (Math.ceil(price) + proceed).toString()
      }
    ];
    console.log(sellerReceive);
    await this.mesh
      .spendingPlutusScriptV3()
      .txIn(
        oldUtxo.input.txHash,
        oldUtxo.input.outputIndex,
        oldUtxo.output.amount,
        scriptAddr,
      )
      .spendingReferenceTxInInlineDatumPresent()
      .spendingReferenceTxInRedeemerValue(conStr(3, []), "JSON") // equal to Finalize in aiken
      .txInScript(this.getScriptCbor())
      .txOut(sellerReceiveAddr, sellerReceive)
      .requiredSignerHash(sellerAddress)
      .requiredSignerHash(buyerAddress)
      .changeAddress(walletAddress)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .selectUtxosFrom(utxos)
      .complete();

    return this.mesh.txHex;
  };
  /**
 * Cancels the BPMN process and refunds participants.
 * @param {UTxO} oldUtxo - The current UTxO state
 * @returns {Promise<string>} The transaction hex
 */

  cancelBpmn = async (oldUtxo: UTxO): Promise<string> => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: "V3" },
      undefined,
      this.networkId
    );
    const inputDatum = deserializeDatum<InitEscrow | ActiveEscrow>(oldUtxo.output.plutusData!);
    const tx = this.mesh
      .spendingPlutusScriptV3()
      .txIn(
        oldUtxo.input.txHash,
        oldUtxo.input.outputIndex,
        oldUtxo.output.amount,
        scriptAddr,
      )
      .spendingReferenceTxInInlineDatumPresent()
      .spendingReferenceTxInRedeemerValue(mConStr2([]), "Mesh") // equal to Cancel in aiken
      .txInScript(this.getScriptCbor())
      .changeAddress(walletAddress)
      .txInCollateral(
        collateral!.input.txHash,
        collateral!.input.outputIndex,
        collateral!.output.amount,
        collateral!.output.address
      )
      .selectUtxosFrom(utxos);
    // if it is InitEscrow, which means that the buyer has not started the escrow yet
    const ownPubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

    if (inputDatum.constructor === 0) {
      const data = deserializeDatum<InitEscrow>(oldUtxo.output.plutusData!);
      const seller = data.fields[0].bytes.toString();
      const proceed = data.fields[4].int as number;
      const sellerRefunded = [
        {
          unit: "lovelace",
          quantity: (proceed).toString()
        }
      ];
      tx
        .txOut(this.getAddressfromPubKeyHash(byteString(seller)), sellerRefunded)
        .requiredSignerHash(seller);
    }

    else {

      const { buyer: buyer, seller: seller, price: price, proceed: proceed } = this.getDataFromActiveEscrowDatum(oldUtxo);
      if (ownPubKeyHash !== (buyer) && ownPubKeyHash !== (seller)) {
        throw new Error("Only buyer or seller can cancel the escrow");
      }
      const buyerRefunded = [
        {
          unit: "lovelace",
          quantity: price.toString()
        }
      ];

      const sellerRefunded = [{
        unit: "lovelace",
        quantity: proceed.toString()
      }];
      tx.
        txOut(this.getAddressfromPubKeyHash(byteString(seller)), sellerRefunded)
        .txOut(this.getAddressfromPubKeyHash(byteString(buyer)), buyerRefunded)
        .requiredSignerHash(ownPubKeyHash);
    }
    await tx
      .complete();

    return this.mesh.txHex;
  };
  /**
 * Returns the compiled script CBOR.
 * @returns {string} The script CBOR
 * @private
 */
  getScriptCbor = (): string => {
    let script = BpmnEscrowBlueprint.validators[0]!.compiledCode;
    return applyParamsToScript(script, []);
  };

  /**
   * Retrieves wallet information needed for transactions.
   * @returns {Promise<{utxos: UTxO[], walletAddress: string, collateral: UTxO | undefined}>}
   * @private
   */
  getWalletInfoForTx = async (): Promise<{ utxos: UTxO[]; walletAddress: string; collateral: UTxO | undefined; }> => {
    let utxos = await this.wallet.getUtxos();
    let walletAddress = await this.wallet.getChangeAddress();
    let collateralRaw = await this.wallet.getCollateral();
    let collateral = collateralRaw ? collateralRaw[0] : undefined;
    return { utxos, walletAddress, collateral };
  };

  /**
   * Fetches a UTxO by its hash.
   * @param {string} hash - The transaction hash
   * @returns {Promise<UTxO | undefined>} The found UTxO or undefined
   */

  getUtxobyHash = async (hash: string): Promise<UTxO | undefined> => {
    if (this.fetcher) {
      // console.log(hash);
      const utxos = await this.fetcher?.fetchUTxOs(hash);
      // console.log(utxos);
      return utxos[0];
    }
  };

  /**
   * Extracts relevant data from an ActiveEscrow datum.
   * @param {UTxO} utxo - The UTxO containing the ActiveEscrow datum
   * @returns {{buyer: string, seller: string, price: number, proceed: number}}
   * @private
   */

  getDataFromActiveEscrowDatum = (utxo: UTxO): { buyer: string; seller: string; price: number; proceed: number; } => {
    const data = deserializeDatum<ActiveEscrow>(utxo.output.plutusData!);
    return {
      buyer: data.fields[0].bytes.toString(),
      seller: data.fields[1].bytes.toString(),
      price: data.fields[2].int as number,
      proceed: data.fields[5].int as number
    };
  };
  /**
 * Converts a public key hash to a Cardano address.
 * @param {ByteString} pubKeyHash - The public key hash
 * @returns {string} The Cardano address
 * @private
 */
  getAddressfromPubKeyHash = (pubKeyHash: ByteString): string => {
    const pubKeyAddress: PubKeyAddress = conStr0([
      conStr0([pubKeyHash])
      , conStr1([])
    ]);
    return serializeAddressObj(pubKeyAddress, this.networkId);
  };

}
