import React from 'react';
import { CardanoWallet } from '@meshsdk/react';
import { useWallet } from '@meshsdk/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface PlaygroundLayoutProps {
  children: React.ReactNode;
}

const PlaygroundLayout: React.FC<PlaygroundLayoutProps> = ({ children }) => {
  const { connected } = useWallet();
  const router = useRouter();

  const navigationItems = [
    { path: '/playgroundTransaction', label: 'Overview' },
    { path: '/playgroundTransaction/bpmn-utils', label: 'BPMN Utils' },
    { path: '/playgroundTransaction/transaction', label: 'Transaction Tools' },
    { path: '/playgroundTransaction/utxo', label: 'UTxO Browser' },
    { path: '/playgroundTransaction/workflow', label: 'Workflow Operations' },
  ];

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
    <div className='min-h-screen bg-gray-100'>
      <nav className='bg-white shadow-md'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <span className='text-xl font-bold text-gray-800'>BPMN Playground</span>
              </div>
              <div className='hidden md:ml-6 md:flex md:space-x-4'>
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${
                      router.pathname === item.path
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className='flex items-center'>
              <CardanoWallet />
            </div>
          </div>
        </div>
      </nav>

      <main className='max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {children}
      </main>
    </div>
  );
};

export default PlaygroundLayout;