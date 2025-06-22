import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            🪂 Foil Lab
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Analyze your wingfoil sessions with advanced wind and performance metrics
          </p>
          <div className="space-y-4">
            <Link
              href="/analyze"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Analysis
            </Link>
            <p className="text-sm text-gray-500">
              Upload a GPX file to get started
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">📊 Track Analysis</h3>
              <p className="text-gray-600">
                Automatic segment detection and wind direction estimation
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">💨 VMG Calculation</h3>
              <p className="text-gray-600">
                Distance-weighted velocity made good for accurate performance metrics
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">📈 Performance Metrics</h3>
              <p className="text-gray-600">
                Detailed analysis of your upwind angles and speed
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
