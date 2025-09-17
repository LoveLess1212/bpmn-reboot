import React from 'react';

interface ResultsSectionProps {
  txHex?: string;
  error?: string;
  loading?: boolean;
  onSubmitTransaction: (hex: string) => void;
  onCopyToClipboard: (text: string) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  txHex,
  error,
  loading,
  onSubmitTransaction,
  onCopyToClipboard,
}) => {
  if (!txHex && !error && !loading) return null;

  return (
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
          <pre className='text-red-700 text-sm whitespace-pre-wrap'>{error}</pre>
        </div>
      )}

      {txHex && (
        <div className='bg-green-50 border border-green-200 rounded p-4'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='text-green-800 font-medium'>Transaction Hex:</h3>
            <button
              onClick={() => onCopyToClipboard(txHex)}
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
            Transaction built successfully! You can now submit this hex to the
            Cardano network.
          </p>
          <button
            onClick={() => onSubmitTransaction(txHex)}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2'
          >
            Submit Transaction
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;