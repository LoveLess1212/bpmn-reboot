import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>BPMN Reboot - Development Playground</title>
        <meta name="description" content="BPMN Parser and Transaction Playground for Cardano" />
      </Head>
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to BPMN Reboot
            </h1>
            <p className="text-lg text-gray-600">
              Development playground for testing BPMN parsing and blockchain transactions
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/playgroundParser" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">⚙️</span>
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600">
                    Parser Playground
                  </h2>
                </div>
                <p className="text-gray-600">
                  Test BPMN XML parsing, explore workflow elements, and validate parser methods in real-time.
                </p>
                <div className="mt-4 text-blue-600 font-medium group-hover:underline">
                  Open Parser Playground →
                </div>
              </div>
            </Link>

            <Link href="/playgroundTransaction" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">💳</span>
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600">
                    Transaction Playground
                  </h2>
                </div>
                <p className="text-gray-600">
                  Test blockchain transactions, smart contract interactions, and workflow enactment.
                </p>
                <div className="mt-4 text-blue-600 font-medium group-hover:underline">
                  Open Transaction Playground →
                </div>
              </div>
            </Link>
          </div>

          {/* Features Overview */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <div className="font-medium">BPMN XML Parser</div>
                  <div className="text-sm text-gray-600">Parse and validate BPMN choreography files</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <div className="font-medium">Interactive Navigation</div>
                  <div className="text-sm text-gray-600">Explore workflow elements and connections</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <div className="font-medium">Real-time Testing</div>
                  <div className="text-sm text-gray-600">Test parser methods and see results instantly</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <div className="font-medium">Error Handling</div>
                  <div className="text-sm text-gray-600">Clear error messages and validation feedback</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
