import { useState, useEffect } from 'react';
import { BpmnEscrowContract } from '../../common/transactions/bpmnescrow/offchain';
import { getNodeState } from '../../common/transactions/bpmnescrow/helper';
import { MeshTxBuilder, BrowserWallet, resolveDataHash } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { BlockFrostProd } from '../../common/Provider';

export const useTransactionPlayground = () => {
  const { wallet, connected } = useWallet();
  const [contract, setContract] = useState<BpmnEscrowContract | null>(null);
  const [txHex, setTxHex] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Form states for different operations
  const [sellerListingForm, setSellerListingForm] = useState({
    current: 'task1',
    buyerAddress: '',
    hashBpmn: 'bpmn_hash_example',
    outgoing: 'task2,task3',
  });

  const [runTaskForm, setRunTaskForm] = useState({
    utxoHash: '',
    utxoIndex: '0',
    newCurrent: 'task2',
    incoming: 'task1',
    outgoing: 'task3,task4',
    artifactCID: 'QmExampleCID123456789',
  });

  const [compensatedForm, setCompensatedForm] = useState({
    utxoHash: '',
  });

  const [uncompensatedForm, setUncompensatedForm] = useState({
    utxoHash: '',
    utxoIndex: '0',
  });

  const [showUtxosBrowser, setShowUtxosBrowser] = useState<boolean>(false);
  const [availableUtxos, setAvailableUtxos] = useState<any[]>([]);

  // Utility function states
  const [bpmnContent, setBpmnContent] = useState<string>('');
  const [hashedBpmn, setHashedBpmn] = useState<string>('');
  const [txHexToSign, setTxHexToSign] = useState<string>('');
  const [signedTxHex, setSignedTxHex] = useState<string>('');

  // Add wallet address state
  const [walletAddress, setWalletAddress] = useState<string>('');

  // TX Hash lookup states
  const [txHashInput, setTxHashInput] = useState<string>('');
  const [txUtxos, setTxUtxos] = useState<any[]>([]);
  const [txLookupLoading, setTxLookupLoading] = useState<boolean>(false);
  const [txLookupError, setTxLookupError] = useState<string>('');

  const loadAvailableUtxos = async () => {
    if (!wallet) return;
    try {
      const utxos = await wallet.getUtxos();
      setAvailableUtxos(utxos);
      setShowUtxosBrowser(true);
    } catch (err) {
      setError(`Failed to load UTxOs: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const [networkId, setNetworkId] = useState<number>(0); // 0 for preprod, 1 for mainnet
  const [proceedPerTask, setProceedPerTask] = useState<number>(2000000);

  useEffect(() => {
    if (connected && wallet) {
      const mesh = new MeshTxBuilder();
      const fetcher = BlockFrostProd();
      console.log('Using Blockfrost API Key:', process.env.BLOCK_FROST_API);
      const contractInstance = new BpmnEscrowContract({
        mesh,
        fetcher,
        wallet: wallet as BrowserWallet,
        networkId,
        proceedPerTask,
      });
      setContract(contractInstance);
      loadWalletAddress();
    }
  }, [connected, wallet, networkId, proceedPerTask]);

  const submitTransaction = async (hex: string) => {
    if (!wallet || !hex.trim()) {
      setError('Please ensure wallet is connected and transaction hex is available');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const txHash = await wallet.submitTx(hex);
      setTxHex('');
      alert(`Transaction submitted successfully!\nTx Hash: ${txHash}\n\nYou can track this transaction on a Cardano explorer.`);
      if (showUtxosBrowser) {
        await loadAvailableUtxos();
      }
    } catch (err) {
      console.error('Transaction submission failed:', err);
      setError(`Transaction Submission Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const lookupTxUtxos = async () => {
    if (!txHashInput.trim()) {
      setTxLookupError('Please enter a transaction hash');
      return;
    }
    if (!contract) {
      setTxLookupError('Contract not initialized. Please ensure wallet is connected.');
      return;
    }
    try {
      setTxLookupLoading(true);
      setTxLookupError('');
      setTxUtxos([]);
      const utxos = await contract.getUtxobyHash(txHashInput.trim());
      const utxoArray = utxos ? [utxos] : [];
      setTxUtxos(utxoArray);
      if (utxoArray.length === 0) {
        setTxLookupError('No UTxOs found for this transaction hash');
      }
    } catch (err) {
      setTxLookupError(`Failed to lookup transaction: ${err instanceof Error ? err.message : String(err)}`);
      setTxUtxos([]);
    } finally {
      setTxLookupLoading(false);
    }
  };

  const clearTxLookup = () => {
    setTxHashInput('');
    setTxUtxos([]);
    setTxLookupError('');
  };

  const loadWalletAddress = async () => {
    if (wallet) {
      try {
        const changeAddress = await wallet.getChangeAddress();
        setWalletAddress(changeAddress);
      } catch (err) {
        console.error('Failed to load wallet address:', err);
      }
    }
  };

  const clearResults = () => {
    setTxHex('');
    setError('');
  };

  const findUtxo = async (utxoHash: string, utxoIndex: string) => {
    if (!wallet) return null;
    const allUtxos = await wallet.getUtxos();
    let utxo = allUtxos.find(
      (u) =>
        u.input.txHash === utxoHash &&
        u.input.outputIndex.toString() === utxoIndex
    );
    if (!utxo && contract) {
      try {
        utxo = await contract.getUtxobyHash(utxoHash, parseInt(utxoIndex));
      } catch (blockfrostError) {
        console.warn('Blockfrost fetch failed, continuing with wallet-only approach:', blockfrostError);
      }
    }
    return utxo;
  };

  const handleHashBpmn = async () => {
    try {
      if (!bpmnContent.trim()) {
        setError('Please provide BPMN content to hash');
        return;
      }
      const hash = resolveDataHash(bpmnContent);
      setHashedBpmn(hash);
      setError('');
    } catch (err) {
      setError(`BPMN Hashing Error: ${err instanceof Error ? err.message : String(err)}`);
      setHashedBpmn('');
    }
  };

  const handleSignTransaction = async () => {
    if (!wallet || !txHexToSign.trim()) {
      setError('Please provide transaction hex to sign and ensure wallet is connected');
      return;
    }
    try {
      setLoading(true);
      const signedHex = await wallet.signTx(txHexToSign);
      setSignedTxHex(signedHex);
      setError('');
    } catch (err) {
      setError(`Transaction Signing Error: ${err instanceof Error ? err.message : String(err)}`);
      setSignedTxHex('');
    } finally {
      setLoading(false);
    }
  };

  const handleSellerListing = async () => {
    if (!contract) return;
    clearResults();
    setLoading(true);
    try {
      const outgoingArray = sellerListingForm.outgoing
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      const hex = await contract.sellerListing(
        sellerListingForm.current,
        sellerListingForm.buyerAddress,
        sellerListingForm.hashBpmn,
        outgoingArray
      );
      setTxHex(hex);
    } catch (err) {
      setError(`Seller Listing Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTask = async () => {
    if (!contract || !wallet) return;
    clearResults();
    setLoading(true);
    try {
      const utxo = await findUtxo(runTaskForm.utxoHash, runTaskForm.utxoIndex);
      if (!utxo) {
        throw new Error(`UTxO not found: ${runTaskForm.utxoHash}#${runTaskForm.utxoIndex}. Make sure the UTxO exists and is accessible.`);
      }
      const incomingArray = runTaskForm.incoming
        ? runTaskForm.incoming.split(',').map((s) => s.trim()).filter((s) => s)
        : undefined;
      const outgoingArray = runTaskForm.outgoing
        ? runTaskForm.outgoing.split(',').map((s) => s.trim()).filter((s) => s)
        : undefined;
      const nodeState = getNodeState(runTaskForm.newCurrent, incomingArray, outgoingArray);
      if (!nodeState) {
        throw new Error('Failed to create node state');
      }
      const hex = await contract.runTask(utxo, nodeState, runTaskForm.artifactCID);
      setTxHex(hex);
    } catch (err) {
      setError(`Run Task Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompensated = async () => {
    if (!contract || !wallet) return;
    clearResults();
    setLoading(true);
    try {
      const utxo = await contract.getUtxobyHash(compensatedForm.utxoHash);
      if (!utxo) {
        throw new Error(`UTxO not found for transaction: ${compensatedForm.utxoHash}. Make sure the transaction exists and contains a script UTxO.`);
      }
      const hex = await contract.compensated(utxo);
      setTxHex(hex);
    } catch (err) {
      setError(`Compensated Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUncompensated = async () => {
    if (!contract || !wallet) return;
    clearResults();
    setLoading(true);
    try {
      const utxo = await findUtxo(uncompensatedForm.utxoHash, uncompensatedForm.utxoIndex);
      if (!utxo) {
        throw new Error(`UTxO not found: ${uncompensatedForm.utxoHash}#${uncompensatedForm.utxoIndex}. Make sure the UTxO exists and is accessible.`);
      }
      const hex = await contract.uncompensated(utxo);
      setTxHex(hex);
    } catch (err) {
      setError(`Uncompensated Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return {
    wallet,
    connected,
    contract,
    txHex,
    setTxHex,
    error,
    setError,
    loading,
    sellerListingForm,
    setSellerListingForm,
    runTaskForm,
    setRunTaskForm,
    compensatedForm,
    setCompensatedForm,
    uncompensatedForm,
    setUncompensatedForm,
    showUtxosBrowser,
    setShowUtxosBrowser,
    availableUtxos,
    setAvailableUtxos,
    bpmnContent,
    setBpmnContent,
    hashedBpmn,
    setHashedBpmn,
    txHexToSign,
    setTxHexToSign,
    signedTxHex,
    setSignedTxHex,
    walletAddress,
    setWalletAddress,
    txHashInput,
    setTxHashInput,
    txUtxos,
    setTxUtxos,
    txLookupLoading,
    setTxLookupLoading,
    txLookupError,
    setTxLookupError,
    networkId,
    setNetworkId,
    proceedPerTask,
    setProceedPerTask,
    loadAvailableUtxos,
    submitTransaction,
    lookupTxUtxos,
    clearTxLookup,
    loadWalletAddress,
    clearResults,
    findUtxo,
    handleHashBpmn,
    handleSignTransaction,
    handleSellerListing,
    handleRunTask,
    handleCompensated,
    handleUncompensated,
    copyToClipboard,
  };
};
