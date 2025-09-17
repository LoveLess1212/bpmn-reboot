import React from 'react';
import PlaygroundLayout from '../../../components/playground/layout/PlaygroundLayout';
import { useTransactionPlaygroundStore } from '../../../components/playground/store/useTransactionPlaygroundStore';
import ResultsSection from '../../../components/playground/sections/ResultsSection';
import GlobalSettings from '../../../components/playground/sections/GlobalSettings';

const BPMNUtilsPlayground = () => {
  const {
    bpmnContent,
    setBpmnContent,
    hashedBpmn,
    error,
    loading,
    networkId,
    setNetworkId,
    proceedPerTask,
    setProceedPerTask,
    handleHashBpmn,
    copyToClipboard,
    submitTransaction
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

        {/* BPMN Hashing */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold mb-4'>Hash BPMN Content</h2>
          <p className='text-sm text-gray-600 mb-3'>
            Generate a hash from BPMN content for use in contract initialization
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

        {/* Instructions */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h2 className='text-xl font-semibold mb-4 text-blue-800'>
            Instructions & Usage
          </h2>
          <div className='text-blue-700 space-y-3'>
            <div>
              <h3 className='font-semibold'>📝 How to Use:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Paste your BPMN XML content into the text area</li>
                <li>Click "Generate Hash" to create a consistent hash</li>
                <li>Use the generated hash in contract initialization</li>
                <li>The same BPMN content will always generate the same hash</li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold'>⚠️ Important Notes:</h3>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Whitespace and formatting do not affect the hash</li>
                <li>Hash is used to verify BPMN content on-chain</li>
                <li>Store your BPMN content securely for future reference</li>
              </ul>
            </div>
          </div>
        </div>

        <ResultsSection
                  error={error}
                  loading={loading}
                  onCopyToClipboard={copyToClipboard} 
                  onSubmitTransaction={submitTransaction}        />
      </div>
    </PlaygroundLayout>
  );
};

export default BPMNUtilsPlayground;