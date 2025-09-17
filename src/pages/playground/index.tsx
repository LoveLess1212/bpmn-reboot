import { useRouter } from 'next/router';
import  PlaygroundLayout  from '../../components/playground/layout/PlaygroundLayout';

const PlaygroundPage = () => {
  const router = useRouter();

  const navigations = [
    {
      title: 'BPMN Utils',
      description: 'Hash BPMN files and view their content',
      path: '/playground/bpmn-utils',
    },
    {
      title: 'Transaction Operations',
      description: 'Sign and submit transactions',
      path: '/playground/transaction',
    },
    {
      title: 'UTxO Browser',
      description: 'Browse and lookup UTxOs from transactions',
      path: '/playground/utxo',
    },
    {
      title: 'Workflow Operations',
      description: 'Execute workflow operations: seller listing, run task, compensated/uncompensated',
      path: '/playground/workflow',
    },
  ];

  return (
    <PlaygroundLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">BPMN Workflow Playground</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navigations.map((nav) => (
            <button
              key={nav.path}
              onClick={() => router.push(nav.path)}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left"
            >
              <h2 className="text-xl font-semibold mb-2">{nav.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{nav.description}</p>
            </button>
          ))}
        </div>
      </div>
    </PlaygroundLayout>
  );
};

export default PlaygroundPage;