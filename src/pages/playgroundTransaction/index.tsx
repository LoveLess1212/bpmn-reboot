import React from 'react';
import { CardanoWallet } from '@meshsdk/react';
import { useTransactionPlayground } from './useTransactionPlayground';

const DevPlayground = () => {
  const {
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
    handleHashBpmn,
    handleSignTransaction,
    handleSellerListing,
    handleRunTask,
    handleCompensated,
    handleUncompensated,
    copyToClipboard,
  } = useTransactionPlayground();
  if (!connected) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold mb-4'>
            BPMN Escrow Dev Playground
          </h1>
          <p className='mb-4'>Please connect your wallet to continue:</p>
          <CardanoWallet />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6'>BPMN Escrow Dev Playground</h1>

        {/* Global Settings */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Global Settings</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Network</label>
              <select
                value={networkId}
                onChange={(e) => setNetworkId(Number(e.target.value))}
                className='w-full p-2 border rounded'
              >
                <option value={0}>Preprod (Testnet)</option>
                <option value={1}>Mainnet</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Proceed Per Task (lovelace)
              </label>
              <input
                type='number'
                value={proceedPerTask}
                onChange={(e) => setProceedPerTask(Number(e.target.value))}
                className='w-full p-2 border rounded'
              />
            </div>
          </div>
          <div className='bg-green-50 border border-green-200 rounded p-3'>
            <p className='text-green-800 text-sm'>
              ✅ <strong>Blockfrost Provider Active:</strong> Using your
              configured Blockfrost provider for blockchain data fetching
            </p>
          </div>
        </div>
        {/* Wallet Information */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>👛 Wallet Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Connection Status
              </label>
              <div className='p-2 bg-gray-50 border rounded'>
                {connected ? (
                  <span className='text-green-600 font-medium'>
                    ✅ Connected
                  </span>
                ) : (
                  <span className='text-red-600 font-medium'>
                    ❌ Disconnected
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Wallet Type
              </label>
              <div className='p-2 bg-gray-50 border rounded'>
                {connected ? 'Browser Wallet' : 'Not Connected'}
              </div>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-2'>
                Change Address
              </label>
              <div className='p-2 bg-gray-50 border rounded font-mono text-sm break-all'>
                {walletAddress ? (
                  <span>{walletAddress}</span>
                ) : connected ? (
                  <span className='text-gray-500'>Loading address...</span>
                ) : (
                  <span className='text-gray-500'>
                    Connect wallet to view address
                  </span>
                )}
              </div>
              {walletAddress && (
                <button
                  onClick={() => copyToClipboard(walletAddress)}
                  className='mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600'
                >
                  Copy Address
                </button>
              )}
            </div>
          </div>
          {connected && (
            <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded'>
              <p className='text-blue-800 text-sm'>
                <strong>Ready:</strong> Wallet connected successfully. You can
                now use all playground features.
              </p>
            </div>
          )}
        </div>
        {/* UTxO Browser */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>UTxO Browser</h2>
            <button
              onClick={loadAvailableUtxos}
              disabled={!wallet}
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
                        {utxo.output.amount.find(
                          (a: any) => a.unit === 'lovelace'
                        )?.quantity
                          ? (
                              parseInt(
                                utxo.output.amount.find(
                                  (a: any) => a.unit === 'lovelace'
                                ).quantity
                              ) / 1000000
                            ).toFixed(2)
                          : '0'}{' '}
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
                          {utxo.output.amount.find(
                            (a: any) => a.unit === 'lovelace'
                          )?.quantity
                            ? (
                                parseInt(
                                  utxo.output.amount.find(
                                    (a: any) => a.unit === 'lovelace'
                                  ).quantity
                                ) / 1000000
                              ).toFixed(2)
                            : '0'}{' '}
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

        {/* Utility Functions */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>🔧 Utility Functions</h2>

          {/* BPMN Hashing */}
          <div className='mb-6 p-4 border rounded-lg bg-gray-50'>
            <h3 className='text-lg font-medium mb-3'>Hash BPMN Content</h3>
            <p className='text-sm text-gray-600 mb-3'>
              Generate a hash from BPMN content for use in contract
              initialization
            </p>
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>
                BPMN Content (XML or text)
              </label>
              <textarea
                value={bpmnContent}
                onChange={(e) => setBpmnContent(e.target.value)}
                className='w-full h-32 p-2 border rounded font-mono text-sm'
                placeholder='Paste your BPMN XML content or any text you want to hash...'
              />
            </div>
            <div className='flex gap-4 items-center mb-4'>
              <button
                onClick={handleHashBpmn}
                disabled={!bpmnContent.trim()}
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400'
              >
                Generate Hash
              </button>
              {hashedBpmn && (
                <button
                  onClick={() => copyToClipboard(hashedBpmn)}
                  className='bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600'
                >
                  Copy Hash
                </button>
              )}
            </div>
            {hashedBpmn && (
              <div className='bg-green-50 border border-green-200 rounded p-3'>
                <label className='block text-sm font-medium mb-2'>
                  Generated Hash:
                </label>
                <code className='block bg-white p-2 rounded border font-mono text-sm break-all'>
                  {hashedBpmn}
                </code>
              </div>
            )}
          </div>

          {/* Transaction Signing */}
          <div className='p-4 border rounded-lg bg-gray-50'>
            <h3 className='text-lg font-medium mb-3'>Sign Transaction</h3>
            <p className='text-sm text-gray-600 mb-3'>
              Sign a transaction hex from another party for multi-party
              workflows
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
              <button
                onClick={handleSignTransaction}
                disabled={loading || !txHexToSign.trim() || !wallet}
                className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400'
              >
                {loading ? 'Signing...' : 'Sign Transaction'}
              </button>
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
                  Transaction signed successfully! This can now be submitted by
                  any party.
                </p>
                <button
                  onClick={() => submitTransaction(signedTxHex)}
                  className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                >
                  Submit Transaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seller Listing */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>
            1. Seller Listing (Init Contract)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Current Task ID
              </label>
              <input
                type='text'
                value={sellerListingForm.current}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    current: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Buyer Address
              </label>
              <input
                type='text'
                value={sellerListingForm.buyerAddress}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    buyerAddress: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
                placeholder='addr1...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                BPMN Hash
              </label>
              <input
                type='text'
                value={sellerListingForm.hashBpmn}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    hashBpmn: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Outgoing Tasks (comma separated)
              </label>
              <input
                type='text'
                value={sellerListingForm.outgoing}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    outgoing: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
                placeholder='task2,task3'
              />
            </div>
          </div>
          <button
            onClick={handleSellerListing}
            disabled={loading || !contract}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400'
          >
            Create Seller Listing
          </button>
        </div>

        {/* Run Task */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>
            2. Run Task (Progress Workflow)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                UTxO Hash
              </label>
              <input
                type='text'
                value={runTaskForm.utxoHash}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, utxoHash: e.target.value })
                }
                className='w-full p-2 border rounded'
                placeholder='Transaction hash (or hash#index format)'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Supports both separate hash+index or combined hash#index format
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                UTxO Index
              </label>
              <input
                type='number'
                value={runTaskForm.utxoIndex}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, utxoIndex: e.target.value })
                }
                className='w-full p-2 border rounded'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                New Current Task
              </label>
              <input
                type='text'
                value={runTaskForm.newCurrent}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, newCurrent: e.target.value })
                }
                className='w-full p-2 border rounded'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Incoming Tasks (comma separated)
              </label>
              <input
                type='text'
                value={runTaskForm.incoming}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, incoming: e.target.value })
                }
                className='w-full p-2 border rounded'
                placeholder='task1'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Outgoing Tasks (comma separated)
              </label>
              <input
                type='text'
                value={runTaskForm.outgoing}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, outgoing: e.target.value })
                }
                className='w-full p-2 border rounded'
                placeholder='task3,task4'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Artifact CID
              </label>
              <input
                type='text'
                value={runTaskForm.artifactCID}
                onChange={(e) =>
                  setRunTaskForm({
                    ...runTaskForm,
                    artifactCID: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
                placeholder='QmExampleCID123456789'
              />
            </div>
          </div>
          <button
            onClick={handleRunTask}
            disabled={loading || !contract}
            className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400'
          >
            Run Task
          </button>
        </div>

        {/* Compensated */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>
            3. Compensated (End with Compensation)
          </h2>
          <div className='grid grid-cols-1 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                UTxO Transaction Hash
              </label>
              <input
                type='text'
                value={compensatedForm.utxoHash}
                onChange={(e) =>
                  setCompensatedForm({
                    ...compensatedForm,
                    utxoHash: e.target.value,
                  })
                }
                className='w-full p-2 border rounded font-mono text-sm'
                placeholder='Transaction hash (will auto-detect the correct UTxO)'
              />
              <p className='text-xs text-gray-500 mt-1'>
                The system will automatically find the script UTxO from this
                transaction
              </p>
            </div>
          </div>
          <button
            onClick={handleCompensated}
            disabled={loading || !contract}
            className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400'
          >
            Execute Compensated
          </button>
        </div>

        {/* Uncompensated */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>
            4. Uncompensated (Successful Completion)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                UTxO Hash
              </label>
              <input
                type='text'
                value={uncompensatedForm.utxoHash}
                onChange={(e) =>
                  setUncompensatedForm({
                    ...uncompensatedForm,
                    utxoHash: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
                placeholder='Transaction hash'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                UTxO Index
              </label>
              <input
                type='number'
                value={uncompensatedForm.utxoIndex}
                onChange={(e) =>
                  setUncompensatedForm({
                    ...uncompensatedForm,
                    utxoIndex: e.target.value,
                  })
                }
                className='w-full p-2 border rounded'
              />
            </div>
          </div>
          <button
            onClick={handleUncompensated}
            disabled={loading || !contract}
            className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400'
          >
            Execute Uncompensated
          </button>
        </div>

        {/* Results */}
        {(txHex || error || loading) && (
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Results</h2>

            {loading && (
              <div className='text-blue-600 mb-4'>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
                Processing transaction...
              </div>
            )}

            {error && (
              <div className='bg-red-50 border border-red-200 rounded p-4 mb-4'>
                <h3 className='text-red-800 font-medium mb-2'>Error:</h3>
                <pre className='text-red-700 text-sm whitespace-pre-wrap'>
                  {error}
                </pre>
              </div>
            )}

            {txHex && (
              <div className='bg-green-50 border border-green-200 rounded p-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-green-800 font-medium'>
                    Transaction Hex:
                  </h3>
                  <button
                    onClick={() => copyToClipboard(txHex)}
                    className='bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600'
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  readOnly
                  value={txHex}
                  className='w-full h-40 p-2 text-sm font-mono bg-white border rounded'
                />
                <p className='text-sm text-green-700 mt-2'>
                  Transaction built successfully! You can now submit this hex to
                  the Cardano network.
                </p>
                <button
                  onClick={() => submitTransaction(txHex)}
                  className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                >
                  Submit Transaction
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h2 className='text-xl font-semibold mb-4 text-blue-800'>
            Instructions & Workflow
          </h2>
          <div className='text-blue-700 space-y-3'>
            <div>
              <h3 className='font-semibold'>🔗 Workflow Steps:</h3>
              <ol className='list-decimal list-inside ml-4 space-y-1'>
                <li>
                  <strong>Seller Listing:</strong> Creates the initial escrow
                  contract. The seller deposits the proceed amount.
                </li>
                <li>
                  <strong>Run Task:</strong> Both parties progress the workflow
                  through different tasks.
                </li>
                <li>
                  <strong>End State:</strong> Choose either Compensated or
                  Uncompensated to conclude the workflow.
                </li>
              </ol>
            </div>

            <div>
              <h3 className='font-semibold'>� Utility Functions:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>
                  <strong>Hash BPMN:</strong> Generate consistent hashes from
                  BPMN XML content for contract initialization
                </li>
                <li>
                  <strong>Sign Transaction:</strong> Sign transaction hex from
                  other parties for multi-party workflows
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold'>�📋 How to Use:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Connect your wallet first</li>
                <li>
                  Use utility functions to hash BPMN content and sign
                  collaborative transactions
                </li>
                <li>
                  The playground uses your configured Blockfrost provider for
                  enhanced UTxO fetching
                </li>
                <li>
                  Use "Load My UTxOs" to see available UTxOs for spending from
                  your wallet
                </li>
                <li>
                  Copy the UTxO hash and index from the table to use in
                  subsequent operations
                </li>
                <li>
                  UTxOs not in your wallet can be fetched via Blockfrost (useful
                  for script UTxOs)
                </li>
                <li>
                  Each successful transaction creates a new UTxO that can be
                  used as input for the next operation
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold'>⚙️ Parameters Guide:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>
                  <strong>Current Task ID:</strong> Identifier for the current
                  workflow node
                </li>
                <li>
                  <strong>Incoming/Outgoing:</strong> Comma-separated list of
                  connected task IDs
                </li>
                <li>
                  <strong>Artifact CID:</strong> IPFS Content ID for task
                  deliverables
                </li>
                <li>
                  <strong>BPMN Hash:</strong> Hash of the workflow definition
                  (use the Hash BPMN utility)
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold'>🤝 Multi-Party Workflow:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>
                  One party creates the transaction using the contract functions
                </li>
                <li>
                  Copy the transaction hex and share it with other parties
                </li>
                <li>
                  Other parties use "Sign Transaction" to add their signatures
                </li>
                <li>
                  The final signed transaction can be submitted by any party
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold'>⚠️ Important Notes:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Make sure the buyer address is valid for seller listing</li>
                <li>
                  Workflow transitions must be valid (enforced by the validator)
                </li>
                <li>
                  Uncompensated should only be used when the workflow reaches a
                  terminal state
                </li>
                <li>
                  Both buyer and seller must sign transactions (except for
                  initial listing)
                </li>
                <li>
                  BPMN hashing ensures consistent workflow identification across
                  parties
                </li>
              </ul>
            </div>

            <div className='bg-blue-100 p-3 rounded mt-4'>
              <p className='text-sm'>
                <strong>🔄 Typical Flow:</strong> Hash BPMN → Seller Listing →
                Run Task (multiple times) → Compensated/Uncompensated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevPlayground;
