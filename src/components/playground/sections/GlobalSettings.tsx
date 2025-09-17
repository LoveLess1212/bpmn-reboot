import React from 'react';

interface GlobalSettingsProps {
  networkId: number;
  proceedPerTask: number;
  onNetworkChange: (value: number) => void;
  onProceedPerTaskChange: (value: number) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  networkId,
  proceedPerTask,
  onNetworkChange,
  onProceedPerTaskChange,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
      <h2 className='text-xl font-semibold mb-4'>Global Settings</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div>
          <label className='block text-sm font-medium mb-2'>Network</label>
          <select
            value={networkId}
            onChange={(e) => onNetworkChange(Number(e.target.value))}
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
            onChange={(e) => onProceedPerTaskChange(Number(e.target.value))}
            className='w-full p-2 border rounded'
          />
        </div>
      </div>
      <div className='bg-green-50 border border-green-200 rounded p-3'>
        <p className='text-green-800 text-sm'>
          ✅ <strong>Blockfrost Provider Active:</strong> Using your configured
          Blockfrost provider for blockchain data fetching
        </p>
      </div>
    </div>
  );
};

export default GlobalSettings;