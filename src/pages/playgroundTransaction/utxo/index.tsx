import React from 'react';
import PlaygroundLayout from '../../../components/playground/layout/PlaygroundLayout';
import { useTransactionPlaygroundStore } from '../../../components/playground/store/useTransactionPlaygroundStore';
import GlobalSettings from '../../../components/playground/sections/GlobalSettings';

const UTxOBrowserPlayground = () => {
  const {
    networkId,
    setNetworkId,
    proceedPerTask,
    setProceedPerTask,
    showUtxosBrowser,
    availableUtxos,
    txHashInput,
    setTxHashInput,
    txUtxos,
    txLookupLoading,
    txLookupError,
    loadAvailableUtxos,
    lookupTxUtxos,
    clearTxLookup,
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

        {/* UTxO Browser */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>UTxO Browser</h2>
            <button
              onClick={loadAvailableUtxos}
              className='bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:bg-gray-400'
            >
              Load My UTxOs
            </button>
          </div>

          {showUtxosBrowser && (
            <div className='max-h-60 overflow-y-auto border rounded'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left p-2'>Tx Hash</th>
                    <th className='text-left p-2'>Index</th>
                    <th className='text-left p-2'>Amount (ADA)</th>
                    <th className='text-left p-2'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableUtxos.map((utxo, index) => (
                    <tr key={index} className='border-t'>
                      <td className='p-2 font-mono text-xs'>
                        {utxo.input.txHash.substring(0, 20)}...
                      </td>
                      <td className='p-2'>{utxo.input.outputIndex}</td>
                      <td className='p-2'>
                        {(() => {
                          const lovelaceAmount = utxo.output.amount.find(
                            (a) => a.unit === 'lovelace'
                          );
                          return lovelaceAmount
                            ? (parseInt(lovelaceAmount.quantity) / 1000000).toFixed(2)
                            : '0'
                        })()}{' '}
                        ADA
                      </td>
                      <td className='p-2'>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${utxo.input.txHash}#${utxo.input.outputIndex}`
                            )
                          }
                          className='text-blue-600 hover:text-blue-800 text-xs'
                        >
                          Copy Hash#Index
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Lookup */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>🔍 Transaction Lookup</h2>
          <p className='text-sm text-gray-600 mb-4'>
            Enter a transaction hash to view its UTxOs and extract relevant
            information for contract operations
          </p>

          <div className='flex gap-4 mb-4'>
            <div className='flex-1'>
              <label className='block text-sm font-medium mb-2'>
                Transaction Hash
              </label>
              <input
                type='text'
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                className='w-full p-2 border rounded font-mono text-sm'
                placeholder='Enter transaction hash...'
              />
            </div>
            <div className='flex items-end gap-2'>
              <button
                onClick={lookupTxUtxos}
                disabled={txLookupLoading || !txHashInput.trim()}
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400'
              >
                {txLookupLoading ? 'Looking up...' : 'Lookup UTxOs'}
              </button>
              <button
                onClick={clearTxLookup}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
              >
                Clear
              </button>
            </div>
          </div>

          {txLookupError && (
            <div className='bg-red-50 border border-red-200 rounded p-3 mb-4'>
              <p className='text-red-800 text-sm'>{txLookupError}</p>
            </div>
          )}

          {txUtxos.length > 0 && (
            <div className='border rounded-lg overflow-hidden'>
              <div className='bg-gray-50 px-4 py-2 border-b'>
                <h3 className='font-medium text-gray-800'>
                  Found {txUtxos.length} UTxO{txUtxos.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <div className='max-h-80 overflow-y-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-100 sticky top-0'>
                    <tr>
                      <th className='text-left p-3'>Index</th>
                      <th className='text-left p-3'>Address</th>
                      <th className='text-left p-3'>Amount (ADA)</th>
                      <th className='text-left p-3'>Has Datum</th>
                      <th className='text-left p-3'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txUtxos.map((utxo, index) => (
                      <tr key={index} className='border-t hover:bg-gray-50'>
                        <td className='p-3 font-mono'>
                          {utxo.input.outputIndex}
                        </td>
                        <td className='p-3 font-mono text-xs'>
                          {utxo.output.address.substring(0, 20)}...
                        </td>
                        <td className='p-3'>
                          {(() => {
                          const lovelaceAmount = utxo.output.amount.find(
                            (a) => a.unit === 'lovelace'
                          );
                          return lovelaceAmount
                            ? (parseInt(lovelaceAmount.quantity) / 1000000).toFixed(2)
                            : '0'
                        })()}{' '}
                          ADA
                        </td>
                        <td className='p-3'>
                          {utxo.output.plutusData ? (
                            <span className='text-green-600 text-xs'>
                              ✅ Yes
                            </span>
                          ) : (
                            <span className='text-gray-500 text-xs'>❌ No</span>
                          )}
                        </td>
                        <td className='p-3 space-x-2'>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${utxo.input.txHash}#${utxo.input.outputIndex}`
                              )
                            }
                            className='text-blue-600 hover:text-blue-800 text-xs'
                          >
                            Copy Hash#Index
                          </button>
                          {utxo.output.plutusData && (
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(
                                    utxo.output.plutusData,
                                    null,
                                    2
                                  )
                                )
                              }
                              className='text-green-600 hover:text-green-800 text-xs'
                            >
                              Copy Datum
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                <li>Use &quot;Load My UTxOs&quot; to view your wallet&apos;s available UTxOs</li>
                <li>Enter a transaction hash to lookup its UTxOs</li>
                <li>Copy UTxO information for use in other operations</li>
                <li>View and copy Plutus datums from script UTxOs</li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold'>⚠️ Important Notes:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Loading wallet UTxOs requires wallet connection</li>
                <li>Transaction lookup works for any on-chain transaction</li>
                <li>Hash#Index format is used for contract operations</li>
                <li>Plutus datums are available for script UTxOs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PlaygroundLayout>
  );
};

export default UTxOBrowserPlayground;