import React from 'react';

interface WalletInfoProps {
  connected: boolean;
  walletAddress: string;
  onCopyAddress: (address: string) => void;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  connected,
  walletAddress,
  onCopyAddress,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
      <h2 className='text-xl font-semibold mb-4'>👛 Wallet Information</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-2'>
            Connection Status
          </label>
          <div className='p-2 bg-gray-50 border rounded'>
            {connected ? (
              <span className='text-green-600 font-medium'>✅ Connected</span>
            ) : (
              <span className='text-red-600 font-medium'>❌ Disconnected</span>
            )}
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium mb-2'>Wallet Type</label>
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
              onClick={() => onCopyAddress(walletAddress)}
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
            <strong>Ready:</strong> Wallet connected successfully. You can now
            use all playground features.
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletInfo;