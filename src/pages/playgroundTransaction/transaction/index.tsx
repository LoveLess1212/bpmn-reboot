import React from 'react';
import PlaygroundLayout from '../../../components/playground/layout/PlaygroundLayout';
import { useTransactionPlaygroundStore } from '../../../components/playground/store/useTransactionPlaygroundStore';
import ResultsSection from '../../../components/playground/sections/ResultsSection';
import GlobalSettings from '../../../components/playground/sections/GlobalSettings';

const TransactionSigningPlayground = () => {
  const {
    txHexToSign,
    setTxHexToSign,
    signedTxHex,
    isPartialSigning,
    setIsPartialSigning,
    error,
    loading,
    networkId,
    setNetworkId,
    proceedPerTask,
    setProceedPerTask,
    handleSignTransaction,
    submitTransaction,
    copyToClipboard,
  } = useTransactionPlaygroundStore();

  return (
    <PlaygroundLayout>
      <div className='space-y-6'>
        <GlobalSettings
          networkId={networkId}
          proceedPerTask={proceedPerTask}
          onNetworkChange={setNetworkId}
          onProceedPerTaskChange={setProceedPerTask}
        />

        {/* Transaction Signing */}
        <div className='p-4 border rounded-lg bg-gray-50'>
          <h3 className='text-lg font-medium mb-3'>Sign Transaction</h3>
          <p className='text-sm text-gray-600 mb-3'>
            Sign a transaction hex from another party for multi-party workflows
          </p>
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>
              Transaction Hex to Sign
            </label>
            <textarea
              value={txHexToSign}
              onChange={(e) => setTxHexToSign(e.target.value)}
              className='w-full h-24 p-2 border rounded font-mono text-sm'
              placeholder='Paste the transaction hex that needs your signature...'
            />
          </div>
          <div className='flex gap-4 items-center mb-4'>
            <div className='flex items-center gap-4'>
              <button
                onClick={handleSignTransaction}
                disabled={loading || !txHexToSign.trim()}
                className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400'
              >
                {loading ? 'Signing...' : 'Sign Transaction'}
              </button>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='partialSigning'
                  checked={isPartialSigning}
                  onChange={(e) => setIsPartialSigning(e.target.checked)}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <label htmlFor='partialSigning' className='text-sm text-gray-700'>
                  Partial Signing
                </label>
              </div>
            </div>
            {signedTxHex && (
              <button
                onClick={() => copyToClipboard(signedTxHex)}
                className='bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600'
              >
                Copy Signed Tx
              </button>
            )}
          </div>
          {signedTxHex && (
            <div className='bg-green-50 border border-green-200 rounded p-3'>
              <label className='block text-sm font-medium mb-2'>
                Signed Transaction:
              </label>
              <textarea
                readOnly
                value={signedTxHex}
                className='w-full h-20 p-2 text-sm font-mono bg-white border rounded'
              />
              <p className='text-sm text-green-700 mt-2'>
                Transaction signed successfully! This can now be submitted by any
                party.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h2 className='text-xl font-semibold mb-4 text-blue-800'>
            Instructions & Usage
          </h2>
          <div className='text-blue-700 space-y-3'>
            <div>
              <h3 className='font-semibold'>📝 How to Use:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Paste the unsigned transaction hex into the text area</li>
                <li>Select &quot;Partial Signing&quot; if this is not the final signature</li>
                <li>Click &quot;Sign Transaction&quot; to sign with your wallet</li>
                <li>Copy the signed transaction hex to share with other parties</li>
                <li>Submit the transaction once all required signatures are collected</li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold'>⚠️ Important Notes:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>All required parties must sign the transaction</li>
                <li>The order of signing matters for some transactions</li>
                <li>Verify transaction details before signing</li>
                <li>Keep transaction hex secure when sharing</li>
              </ul>
            </div>
          </div>
        </div>

        <ResultsSection
          error={error}
          loading={loading}
          onCopyToClipboard={copyToClipboard}
          onSubmitTransaction={submitTransaction}
        />
      </div>
    </PlaygroundLayout>
  );
};

export default TransactionSigningPlayground;