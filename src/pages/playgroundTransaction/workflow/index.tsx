import React from 'react';
import PlaygroundLayout from '../../../components/playground/layout/PlaygroundLayout';
import { useTransactionPlaygroundStore } from '../../../components/playground/store/useTransactionPlaygroundStore';
import GlobalSettings from '../../../components/playground/sections/GlobalSettings';
import ResultsSection from '../../../components/playground/sections/ResultsSection';

const WorkflowOperationsPlayground = () => {
  const {
    networkId,
    setNetworkId,
    proceedPerTask,
    setProceedPerTask,
    sellerListingForm,
    setSellerListingForm,
    runTaskForm,
    setRunTaskForm,
    compensatedForm,
    setCompensatedForm,
    uncompensatedForm,
    setUncompensatedForm,
    txHex,
    error,
    loading,
    handleSellerListing,
    handleRunTask,
    handleCompensated,
    handleUncompensated,
    submitTransaction,
    copyToClipboard,
  } = useTransactionPlaygroundStore();

  return (
    <PlaygroundLayout>
      <div className="space-y-6">
        <GlobalSettings
          networkId={networkId}
          proceedPerTask={proceedPerTask}
          onNetworkChange={setNetworkId}
          onProceedPerTaskChange={setProceedPerTask}
        />

        {/* Seller Listing */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            1. Seller Listing (Init Contract)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Task ID
              </label>
              <input
                type="text"
                value={sellerListingForm.current}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    current: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Buyer Address
              </label>
              <input
                type="text"
                value={sellerListingForm.buyerAddress}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    buyerAddress: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="addr1..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                BPMN Hash
              </label>
              <input
                type="text"
                value={sellerListingForm.hashBpmn}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    hashBpmn: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Outgoing Tasks (comma separated)
              </label>
              <input
                type="text"
                value={sellerListingForm.outgoing}
                onChange={(e) =>
                  setSellerListingForm({
                    ...sellerListingForm,
                    outgoing: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="task2,task3"
              />
            </div>
          </div>
          <button
            onClick={handleSellerListing}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Create Seller Listing
          </button>
        </div>

        {/* Run Task */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            2. Run Task (Progress Workflow)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                UTxO Hash
              </label>
              <input
                type="text"
                value={runTaskForm.utxoHash}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, utxoHash: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Transaction hash (or hash#index format)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports both separate hash+index or combined hash#index format
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                UTxO Index
              </label>
              <input
                type="text"
                value={runTaskForm.utxoIndex}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, utxoIndex: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                New Current Task
              </label>
              <input
                type="text"
                value={runTaskForm.newCurrent}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, newCurrent: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Incoming Tasks (comma separated)
              </label>
              <input
                type="text"
                value={runTaskForm.incoming}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, incoming: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="task1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Outgoing Tasks (comma separated)
              </label>
              <input
                type="text"
                value={runTaskForm.outgoing}
                onChange={(e) =>
                  setRunTaskForm({ ...runTaskForm, outgoing: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="task3,task4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Artifact CID
              </label>
              <input
                type="text"
                value={runTaskForm.artifactCID}
                onChange={(e) =>
                  setRunTaskForm({
                    ...runTaskForm,
                    artifactCID: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="QmExampleCID123456789"
              />
            </div>
          </div>
          <button
            onClick={handleRunTask}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Run Task
          </button>
        </div>

        {/* Compensated */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            3. Compensated (End with Compensation)
          </h2>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                UTxO Transaction Hash
              </label>
              <input
                type="text"
                value={compensatedForm.utxoHash}
                onChange={(e) =>
                  setCompensatedForm({
                    ...compensatedForm,
                    utxoHash: e.target.value,
                  })
                }
                className="w-full p-2 border rounded font-mono text-sm"
                placeholder="Transaction hash (will auto-detect the correct UTxO)"
              />
              <p className="text-xs text-gray-500 mt-1">
                The system will automatically find the script UTxO from this
                transaction
              </p>
            </div>
          </div>
          <button
            onClick={handleCompensated}
            disabled={loading}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
          >
            Execute Compensated
          </button>
        </div>

        {/* Uncompensated */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            4. Uncompensated (Successful Completion)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                UTxO Hash
              </label>
              <input
                type="text"
                value={uncompensatedForm.utxoHash}
                onChange={(e) =>
                  setUncompensatedForm({
                    ...uncompensatedForm,
                    utxoHash: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Transaction hash"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                UTxO Index
              </label>
              <input
                type="text"
                value={uncompensatedForm.utxoIndex}
                onChange={(e) =>
                  setUncompensatedForm({
                    ...uncompensatedForm,
                    utxoIndex: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={handleUncompensated}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Execute Uncompensated
          </button>
        </div>

        <ResultsSection
          error={error}
          loading={loading}
          txHex={txHex}
          onCopyToClipboard={copyToClipboard}
          onSubmitTransaction={submitTransaction}
        />

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Instructions & Workflow
          </h2>
          <div className="text-blue-700 space-y-3">
            <div>
              <h3 className="font-semibold">🔗 Workflow Steps:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1">
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
              <h3 className="font-semibold">⚙️ Parameters Guide:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
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
                  (from BPMN Utils)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">⚠️ Important Notes:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PlaygroundLayout>
  );
};

export default WorkflowOperationsPlayground;