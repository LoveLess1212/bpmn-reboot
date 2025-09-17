import blueprint from './plutus.json';
import {
  applyParamsToScript,
  BrowserWallet,
  byteString,
  conStr,
  conStr0,
  conStr1,
  IFetcher,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  UTxO,
  deserializeDatum,
  serializeAddressObj,
  PubKeyAddress,
  ByteString,
  Redeemer,
  Action,
} from '@meshsdk/core';
import { ActiveEscrow, InitEscrow, InitEscrowParams, NodeState } from './types';
import {
  activeEscrow,
  initEscrow,
  updateActiveDatum,
  updateDatum,
} from './helper';

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
  private proceedPerTask = 2500000;
  private scriptAddr: string;
  private buyerAddress: string | undefined;
  /**
   * Creates an instance of BpmnEscrowContract.
   * @param {Object} params - The constructor parameters
   * @param {MeshTxBuilder} params.mesh - The Mesh transaction builder instance
   * @param {IFetcher} params.fetcher - The fetcher interface for UTxO operations
   * @param {BrowserWallet | MeshWallet} params.wallet - The wallet instance
   * @param {number} [params.networkId=0] - The network ID (0 for preprod, 1 for mainnet)
   * @param {number} [params.proceedPerTask=2500000] - The proceed amount per task in lovelace
   */

  constructor({
    mesh,
    fetcher,
    wallet,
    networkId = 0,
    proceedPerTask = 2500000,
  }: {
    mesh: MeshTxBuilder;
    fetcher: IFetcher;
    wallet: BrowserWallet | MeshWallet;
    networkId?: number;
    proceedPerTask?: number;
  }) {
    this.mesh = mesh;
    this.fetcher = fetcher;
    this.wallet = wallet;
    this.networkId = networkId;
    if (networkId === 1) {
      this.mesh.setNetwork('mainnet');
    } else {
      this.mesh.setNetwork('preprod');
    }
    this.proceedPerTask = proceedPerTask;
    const { address: scriptAddr } = serializePlutusScript(
      { code: this.getScriptCbor(), version: 'V3' },
      undefined,
      this.networkId
    );
    this.scriptAddr = scriptAddr;
  }

  /**
   * Creates a seller listing transaction. This should be equal to the Init action.
   * @param {string} current - The current state identifier
   * @param {string} hashBpmn - The hash of the BPMN process
   * @param {string[]} outgoing - Array of outgoing state identifiers
   * @returns {Promise<string>} The transaction hex
   */
  sellerListing = async (
    current: string,
    buyerAddress: string,
    hashBpmn: string,
    outgoing: string[]
  ): Promise<string> => {
    const { utxos, walletAddress: ownAddress } =
      await this.getWalletInfoForTx();
    const proceed = [
      {
        unit: 'lovelace',
        quantity: this.proceedPerTask.toString(),
      },
    ];
    const initEscrowDatumRaw: InitEscrowParams = {
      buyer: buyerAddress,
      seller: ownAddress,
      current,
      hashBpmn,
      outgoing,
      proceed: this.proceedPerTask,
    };
    const initEscrowDatum = initEscrow(initEscrowDatumRaw);
    const buyerAddr = initEscrowDatum.fields[0].bytes.toString();
    const sellerAddr = initEscrowDatum.fields[1].bytes.toString();
    await this.mesh
      .txOut(this.scriptAddr, proceed)
      .txOutInlineDatumValue(initEscrowDatum, 'JSON')
      .changeAddress(ownAddress)
      .requiredSignerHash(buyerAddr)
      .requiredSignerHash(sellerAddr)
      .selectUtxosFrom(utxos)
      .complete();
    const signedTx = await this.wallet.signTx(this.mesh.txHex, true);
    return signedTx;
  };

  /**
   * Executes a task in the BPMN process.
   * @param {UTxO} oldUtxo - The current UTxO state
   * @param {NodeState} nodeState - The new state to transition to
   * @returns {Promise<string>} The transaction hex
   */

  runTask = async (
    oldUtxo: UTxO,
    nodeState: NodeState,
    artifactCID: string
  ): Promise<string> => {
    try {
      const { utxos, walletAddress, collateral } =
        await this.getWalletInfoForTx();

      const inputDatum = deserializeDatum(oldUtxo.output.plutusData!);
      let outputDatum: ActiveEscrow;
      if (inputDatum.fields.length === 5) {
        outputDatum = updateDatum(inputDatum, nodeState, artifactCID);
      } else {
        outputDatum = updateActiveDatum(inputDatum, nodeState, artifactCID);
      }
      console.log('outputDatum:', outputDatum);
      const { buyer: buyer, seller: seller } = this.getDataFromDatum(oldUtxo);
      // get the old amount of script then + proceed
      const inputLoveLaceFromSCript = oldUtxo.output.amount.find(
        (a) => a.unit === 'lovelace'
      )!.quantity;
      // console.log(inputLoveLaceFromSCript);
      const proceed = [
        {
          unit: 'lovelace',
          quantity: parseInt(inputLoveLaceFromSCript).toString(),
        },
      ];
      const redeemer = conStr(0, []);
      await this.mesh
        .spendingPlutusScriptV3()
        .txIn(
          oldUtxo.input.txHash,
          oldUtxo.input.outputIndex,
          oldUtxo.output.amount,
          this.scriptAddr
        )
        .spendingReferenceTxInInlineDatumPresent()
        .spendingReferenceTxInRedeemerValue(redeemer, 'JSON', {
          mem: 220000,
          steps: 79000000,
        })
        .txInScript(this.getScriptCbor())
        .txOut(this.scriptAddr, proceed)
        .txOutInlineDatumValue(outputDatum, 'JSON')
        .txInCollateral(
          collateral!.input.txHash,
          collateral!.input.outputIndex,
          collateral!.output.amount,
          collateral!.output.address
        )
        .selectUtxosFrom(utxos)
        .requiredSignerHash(buyer)
        .requiredSignerHash(seller)
        .changeAddress(walletAddress)
        .complete();
    } catch (error) {
      console.error('Error running task:', error);
      throw error;
    }
    return this.mesh.txHex;
  };

  /**
   * Compensates the BPMN process and pays the seller the proceed amount.
   * This ends the workflow with compensation to the seller.
   * @param {UTxO} oldUtxo - The current UTxO state
   * @returns {Promise<string>} The transaction hex
   */
  compensated = async (oldUtxo: UTxO): Promise<string> => {
    const { utxos, walletAddress, collateral } =
      await this.getWalletInfoForTx();
    const {
      buyer: buyerAddress,
      seller: sellerAddress,
      proceed: proceed,
    } = this.getDataFromDatum(oldUtxo);
    const sellerReceiveAddr = this.getAddressfromPubKeyHash(
      byteString(sellerAddress)
    );
    const sellerReceive = [
      {
        unit: 'lovelace',
        quantity: proceed.toString(),
      },
    ];
    await this.mesh
      .spendingPlutusScriptV3()
      .txIn(
        oldUtxo.input.txHash,
        oldUtxo.input.outputIndex,
        oldUtxo.output.amount,
        this.scriptAddr
      )
      .spendingReferenceTxInInlineDatumPresent()
      .spendingReferenceTxInRedeemerValue(conStr(1, []), 'JSON', {
        mem: 170000,
        steps: 61000000,
      })
      .txInScript(this.getScriptCbor())
      .txOut(sellerReceiveAddr, sellerReceive)
      .requiredSignerHash(sellerAddress)
      .requiredSignerHash(buyerAddress)
      .changeAddress(walletAddress)
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
   * Completes the BPMN process successfully and pays the seller the proceed amount.
   * This method should only be called when the workflow is in a terminal state (no outgoing transitions).
   * @param {UTxO} oldUtxo - The current UTxO state
   * @returns {Promise<string>} The transaction hex
   */
  uncompensated = async (oldUtxo: UTxO): Promise<string> => {
    const { utxos, walletAddress, collateral } =
      await this.getWalletInfoForTx();
    // console.log(oldUtxo);
    // const inputDatum = deserializeDatum<ActiveEscrow>(oldUtxo.output.plutusData!);
    // console.log(inputDatum);
    const {
      buyer: buyerAddress,
      seller: sellerAddress,
      proceed: proceed,
    } = this.getDataFromDatum(oldUtxo);
    const sellerReceiveAddr = this.getAddressfromPubKeyHash(
      byteString(sellerAddress)
    );

    console.log('sellerReceiveAddr:', sellerReceiveAddr);
    const sellerReceive = [
      {
        unit: 'lovelace',
        quantity: proceed.toString(),
      },
    ];
    await this.mesh
      .spendingPlutusScriptV3()
      .txIn(
        oldUtxo.input.txHash,
        oldUtxo.input.outputIndex,
        oldUtxo.output.amount,
        this.scriptAddr
      )
      .spendingReferenceTxInInlineDatumPresent()
      .spendingReferenceTxInRedeemerValue(conStr(2, []), 'JSON', {
        mem: 170000, // the value is now manually set
        steps: 61000000, // the value is now manually set
      }) // equal to Uncompensated in aiken
      .txInScript(this.getScriptCbor())
      .txOut(sellerReceiveAddr, sellerReceive)
      .requiredSignerHash(sellerAddress)
      .requiredSignerHash(buyerAddress)
      .changeAddress(walletAddress)
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
   * Returns the compiled script CBOR.
   * @returns {string} The script CBOR
   * @private
   */
  getScriptCbor = (): string => {
    const script = BpmnEscrowBlueprint.validators[0]!.compiledCode;
    return applyParamsToScript(script, []);
  };

  /**
   * Retrieves wallet information needed for transactions.
   * @returns {Promise<{utxos: UTxO[], walletAddress: string, collateral: UTxO | undefined}>}
   * @private
   */
  getWalletInfoForTx = async (): Promise<{
    utxos: UTxO[];
    walletAddress: string;
    collateral: UTxO | undefined;
  }> => {
    const utxos = await this.wallet.getUtxos();
    const walletAddress = await this.wallet.getChangeAddress();
    const collateralRaw = await this.wallet.getCollateral();
    console.log('collateralRaw:', collateralRaw);
    const collateral = collateralRaw ? collateralRaw[0] : undefined;
    return { utxos, walletAddress, collateral };
  };

  getUtxobyHash = async (
    hashWithIndex: string,
    outputIndex?: number
  ): Promise<UTxO | undefined> => {
    if (this.fetcher) {
      try {
        let txHash: string;
        let targetIndex: number;

        // Parse hash#index format
        if (hashWithIndex.includes('#')) {
          const parts = hashWithIndex.split('#');
          txHash = parts[0];
          targetIndex = parseInt(parts[1]);
        } else {
          txHash = hashWithIndex;
          targetIndex = outputIndex ?? 0; // Default to 0 if not specified
        }
        console.log(
          `Fetching UTxO for txHash: ${txHash} at index: ${targetIndex}`
        );
        // Fetch all UTxOs for this transaction
        const utxos = await this.fetcher.fetchUTxOs(txHash);

        // Find the specific UTxO by output index
        const foundUtxo = utxos.find(
          (utxo) =>
            utxo.input.txHash === txHash &&
            utxo.input.outputIndex === targetIndex
        );

        return foundUtxo;
      } catch (error) {
        console.error(`Error fetching UTxO ${hashWithIndex}:`, error);
        return undefined;
      }
    }
    return undefined;
  };

  /**
   * Extracts relevant data from an ActiveEscrow datum.
   * @param {UTxO} utxo - The UTxO containing the ActiveEscrow datum
   * @returns {{buyer: string, seller: string, proceed: number}}
   * @private
   */

  getDataFromDatum = (
    utxo: UTxO
  ): { buyer: string; seller: string; proceed: number } => {
    const data = deserializeDatum(utxo.output.plutusData!);
    if (data.fields.length === 5) {
      return {
        buyer: data.fields[0].bytes.toString(),
        seller: data.fields[1].bytes.toString(),
        proceed: Number(data.fields[4].int),
      };
    }
    return {
      buyer: data.fields[0].bytes.toString(),
      seller: data.fields[1].bytes.toString(),
      proceed: Number(data.fields[5].int),
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
      conStr0([pubKeyHash]),
      conStr1([]),
    ]);
    return serializeAddressObj(pubKeyAddress, this.networkId);
  };
}
