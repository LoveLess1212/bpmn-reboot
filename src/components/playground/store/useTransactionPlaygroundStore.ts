import { create } from 'zustand';
import { BpmnEscrowContract } from '../../../common/transactions/bpmnescrow/offchain';
import { UTxO, resolveDataHash, BrowserWallet } from '@meshsdk/core';
import { getNodeState } from '../../../common/transactions/bpmnescrow/helper';

type SetState = {
  (
    partial:
      | TransactionPlaygroundStore
      | Partial<TransactionPlaygroundStore>
      | ((
          state: TransactionPlaygroundStore
        ) => TransactionPlaygroundStore | Partial<TransactionPlaygroundStore>),
    replace?: false | undefined
  ): void;
  (
    state:
      | TransactionPlaygroundStore
      | ((state: TransactionPlaygroundStore) => TransactionPlaygroundStore),
    replace: true
  ): void;
};

interface TransactionPlaygroundStore {
  // Contract and wallet state
  contract: BpmnEscrowContract | null;
  setContract: (contract: BpmnEscrowContract | null) => void;
  wallet: BrowserWallet | null;
  setWallet: (wallet: BrowserWallet | null) => void;

  // Utility functions
  handleHashBpmn: () => Promise<void>;
  handleSignTransaction: () => Promise<void>;
  submitTransaction: (hex: string) => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
  loadAvailableUtxos: () => Promise<void>;
  lookupTxUtxos: () => Promise<void>;
  clearTxLookup: () => void;
  findUtxo: (txHash: string, indexStr: string) => Promise<UTxO | null>;

  // Workflow operations
  handleSellerListing: () => Promise<void>;
  handleRunTask: () => Promise<void>;
  handleCompensated: () => Promise<void>;
  handleUncompensated: () => Promise<void>;

  // Transaction state
  txHex: string;
  setTxHex: (hex: string) => void;
  error: string;
  setError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Global settings
  networkId: number;
  setNetworkId: (id: number) => void;
  proceedPerTask: number;
  setProceedPerTask: (amount: number) => void;

  // UTxO state
  availableUtxos: UTxO[];
  setAvailableUtxos: (utxos: UTxO[]) => void;
  showUtxosBrowser: boolean;
  setShowUtxosBrowser: (show: boolean) => void;

  // Transaction lookup state
  txHashInput: string;
  setTxHashInput: (hash: string) => void;
  txUtxos: UTxO[];
  setTxUtxos: (utxos: UTxO[]) => void;
  txLookupLoading: boolean;
  setTxLookupLoading: (loading: boolean) => void;
  txLookupError: string;
  setTxLookupError: (error: string) => void;

  // Utility state
  bpmnContent: string;
  setBpmnContent: (content: string) => void;
  hashedBpmn: string;
  setHashedBpmn: (hash: string) => void;
  txHexToSign: string;
  setTxHexToSign: (hex: string) => void;
  signedTxHex: string;
  setSignedTxHex: (hex: string) => void;
  isPartialSigning: boolean;
  setIsPartialSigning: (isPartial: boolean) => void;

  // Form states
  sellerListingForm: {
    current: string;
    buyerAddress: string;
    hashBpmn: string;
    outgoing: string;
  };
  setSellerListingForm: (form: {
    current: string;
    buyerAddress: string;
    hashBpmn: string;
    outgoing: string;
  }) => void;

  runTaskForm: {
    utxoHash: string;
    utxoIndex: string;
    newCurrent: string;
    incoming: string;
    outgoing: string;
    artifactCID: string;
  };
  setRunTaskForm: (form: {
    utxoHash: string;
    utxoIndex: string;
    newCurrent: string;
    incoming: string;
    outgoing: string;
    artifactCID: string;
  }) => void;

  compensatedForm: {
    utxoHash: string;
  };
  setCompensatedForm: (form: { utxoHash: string }) => void;

  uncompensatedForm: {
    utxoHash: string;
    utxoIndex: string;
  };
  setUncompensatedForm: (form: { utxoHash: string; utxoIndex: string }) => void;

  // Clear all states
  clearAll: () => void;
}

export const useTransactionPlaygroundStore = create<TransactionPlaygroundStore>(
  (set: SetState) => ({
    // Initial state
    contract: null,
    setContract: (contract) => set({ contract }),
    wallet: null,
    setWallet: (wallet) => set({ wallet }),

    txHex: '',
    setTxHex: (hex) => set({ txHex: hex }),
    error: '',
    setError: (error) => set({ error }),
    loading: false,
    setLoading: (loading) => set({ loading }),

    networkId: 0,
    setNetworkId: (id) => set({ networkId: id }),
    proceedPerTask: 2500000,
    setProceedPerTask: (amount) => set({ proceedPerTask: amount }),

    availableUtxos: [],
    setAvailableUtxos: (utxos) => set({ availableUtxos: utxos }),
    showUtxosBrowser: false,
    setShowUtxosBrowser: (show) => set({ showUtxosBrowser: show }),

    txHashInput: '',
    setTxHashInput: (hash) => set({ txHashInput: hash }),
    txUtxos: [],
    setTxUtxos: (utxos) => set({ txUtxos: utxos }),
    txLookupLoading: false,
    setTxLookupLoading: (loading) => set({ txLookupLoading: loading }),
    txLookupError: '',
    setTxLookupError: (error) => set({ txLookupError: error }),

    findUtxo: async (
      txHash: string,
      indexStr: string
    ): Promise<UTxO | null> => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.contract) return null;
      const utxo = await state.contract.getUtxobyHash(`${txHash}#${indexStr}`);
      return utxo || null;
    },

    bpmnContent: '',
    setBpmnContent: (content) => set({ bpmnContent: content }),
    hashedBpmn: '',
    setHashedBpmn: (hash) => set({ hashedBpmn: hash }),
    txHexToSign: '',
    setTxHexToSign: (hex) => set({ txHexToSign: hex }),
    signedTxHex: '',
    setSignedTxHex: (hex) => set({ signedTxHex: hex }),
    isPartialSigning: false,
    setIsPartialSigning: (isPartial) => set({ isPartialSigning: isPartial }),

    sellerListingForm: {
      current: 'task1',
      buyerAddress: '',
      hashBpmn: 'bpmn_hash_example',
      outgoing: 'task2,task3',
    },
    setSellerListingForm: (form) => set({ sellerListingForm: form }),

    runTaskForm: {
      utxoHash: '',
      utxoIndex: '0',
      newCurrent: 'task2',
      incoming: 'task1',
      outgoing: 'task3,task4',
      artifactCID: 'QmExampleCID123456789',
    },
    setRunTaskForm: (form) => set({ runTaskForm: form }),

    compensatedForm: {
      utxoHash: '',
    },
    setCompensatedForm: (form) => set({ compensatedForm: form }),

    uncompensatedForm: {
      utxoHash: '',
      utxoIndex: '0',
    },
    setUncompensatedForm: (form) => set({ uncompensatedForm: form }),

    clearAll: () =>
      set({
        txHex: '',
        error: '',
        txHashInput: '',
        txUtxos: [],
        txLookupError: '',
        bpmnContent: '',
        hashedBpmn: '',
        txHexToSign: '',
        signedTxHex: '',
      }),

    handleHashBpmn: async () => {
      try {
        const state = useTransactionPlaygroundStore.getState();
        if (!state.bpmnContent.trim()) {
          set({ error: 'Please provide BPMN content to hash' });
          return;
        }
        const hash = resolveDataHash(state.bpmnContent);
        set({ hashedBpmn: hash, error: '' });
      } catch (err) {
        set({
          error: `BPMN Hashing Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
          hashedBpmn: '',
        });
      }
    },

    handleSignTransaction: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.wallet || !state.txHexToSign.trim()) {
        set({
          error:
            'Please provide transaction hex to sign and ensure wallet is connected',
        });
        return;
      }
      try {
        set({ loading: true });
        const signedHex = await state.wallet.signTx(
          state.txHexToSign,
          state.isPartialSigning
        );
        set({ signedTxHex: signedHex, error: '' });
        console.log('Transaction signed successfully:', signedHex);
      } catch (err) {
        set({
          error: `Transaction Signing Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
          signedTxHex: '',
        });
      } finally {
        set({ loading: false });
      }
    },

    submitTransaction: async (hex: string) => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.wallet || !hex.trim()) {
        set({
          error:
            'Please ensure wallet is connected and transaction hex is available',
        });
        return;
      }

      try {
        set({ loading: true, error: '' });
        const txHash = await state.wallet.submitTx(hex);
        set({ txHex: '' });
        alert(
          `Transaction submitted successfully!\nTx Hash: ${txHash}\n\nYou can track this transaction on a Cardano explorer.`
        );
      } catch (err) {
        console.error('Transaction submission failed:', err);
        set({
          error: `Transaction Submission Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      } finally {
        set({ loading: false });
      }
    },

    loadAvailableUtxos: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.wallet) {
        set({ error: 'Wallet not connected' });
        return;
      }
      try {
        const utxos = await state.wallet.getUtxos();
        set({ availableUtxos: utxos, showUtxosBrowser: true });
      } catch (err) {
        set({
          error: `Failed to load UTxOs: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      }
    },

    lookupTxUtxos: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.txHashInput.trim()) {
        set({ txLookupError: 'Please enter a transaction hash' });
        return;
      }
      if (!state.contract) {
        set({
          txLookupError:
            'Contract not initialized. Please ensure wallet is connected.',
        });
        return;
      }
      try {
        set({ txLookupLoading: true, txLookupError: '', txUtxos: [] });
        const utxo = await state.contract.getUtxobyHash(
          state.txHashInput.trim()
        );
        const utxoArray = utxo ? [utxo] : [];
        set({ txUtxos: utxoArray });
        if (utxoArray.length === 0) {
          set({ txLookupError: 'No UTxOs found for this transaction hash' });
        }
      } catch (err) {
        set({
          txLookupError: `Failed to lookup transaction: ${
            err instanceof Error ? err.message : String(err)
          }`,
          txUtxos: [],
        });
      } finally {
        set({ txLookupLoading: false });
      }
    },

    clearTxLookup: () => {
      set({
        txHashInput: '',
        txUtxos: [],
        txLookupError: '',
      });
    },

    handleSellerListing: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.contract) return;
      set({ loading: true, error: '', txHex: '' });
      try {
        const outgoingArray = state.sellerListingForm.outgoing
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        const hex = await state.contract.sellerListing(
          state.sellerListingForm.current,
          state.sellerListingForm.buyerAddress,
          state.sellerListingForm.hashBpmn,
          outgoingArray
        );
        set({ txHex: hex });
      } catch (err) {
        set({
          error: `Seller Listing Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      } finally {
        set({ loading: false });
      }
    },

    handleRunTask: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.contract || !state.wallet) return;
      set({ loading: true, error: '', txHex: '' });
      try {
        const utxo = await state.findUtxo(
          state.runTaskForm.utxoHash,
          state.runTaskForm.utxoIndex
        );
        if (!utxo) {
          throw new Error(
            `UTxO not found: ${state.runTaskForm.utxoHash}#${state.runTaskForm.utxoIndex}. Make sure the UTxO exists and is accessible.`
          );
        }
        const incomingArray = state.runTaskForm.incoming
          ? state.runTaskForm.incoming
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s)
          : undefined;
        const outgoingArray = state.runTaskForm.outgoing
          ? state.runTaskForm.outgoing
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s)
          : undefined;
        const nodeState = getNodeState(
          state.runTaskForm.newCurrent,
          incomingArray,
          outgoingArray
        );
        if (!nodeState) {
          throw new Error('Failed to create node state');
        }
        const hex = await state.contract.runTask(
          utxo,
          nodeState,
          state.runTaskForm.artifactCID
        );
        set({ txHex: hex });
      } catch (err) {
        set({
          error: `Run Task Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      } finally {
        set({ loading: false });
      }
    },

    handleCompensated: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.contract || !state.wallet) return;
      set({ loading: true, error: '', txHex: '' });
      try {
        const utxo = await state.contract.getUtxobyHash(
          state.compensatedForm.utxoHash
        );
        if (!utxo) {
          throw new Error(
            `UTxO not found for transaction: ${state.compensatedForm.utxoHash}. Make sure the transaction exists and contains a script UTxO.`
          );
        }
        const hex = await state.contract.compensated(utxo);
        set({ txHex: hex });
      } catch (err) {
        set({
          error: `Compensated Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      } finally {
        set({ loading: false });
      }
    },

    handleUncompensated: async () => {
      const state = useTransactionPlaygroundStore.getState();
      if (!state.contract || !state.wallet) return;
      set({ loading: true, error: '', txHex: '' });
      try {
        const utxo = await state.findUtxo(
          state.uncompensatedForm.utxoHash,
          state.uncompensatedForm.utxoIndex
        );
        if (!utxo) {
          throw new Error(
            `UTxO not found: ${state.uncompensatedForm.utxoHash}#${state.uncompensatedForm.utxoIndex}. Make sure the UTxO exists and is accessible.`
          );
        }
        const hex = await state.contract.uncompensated(utxo);
        set({ txHex: hex });
      } catch (err) {
        set({
          error: `Uncompensated Error: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      } finally {
        set({ loading: false });
      }
    },

    copyToClipboard: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    },
  })
);
