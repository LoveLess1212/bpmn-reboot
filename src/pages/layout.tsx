// this looks broken AF, but it's AI generated XD, next sprint will fix it

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Parser Playground', href: '/playgroundParser', icon: '⚙️' },
    { name: 'Transaction Playground', href: '/playgroundTransaction', icon: '💳' },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navigation */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className={`font-bold text-lg ${isOpen ? 'block' : 'hidden'}`}>
              BPMN Reboot
            </h2>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              {isOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`ml-3 ${isOpen ? 'block' : 'hidden'}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className={`text-sm text-gray-400 ${isOpen ? 'block' : 'hidden'}`}>
              <div>BPMN Parser & Transaction</div>
              <div>Playground Suite</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {navigation.find(item => isActive(item.href))?.name || 'BPMN Reboot'}
            </h1>
            <div className="text-sm text-gray-500">
              Development Playground
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;