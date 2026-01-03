import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { mockVerificationResult } from './utils/mockData';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerification = async (data) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Use mock data for now - will be replaced with real API call
      setResults(mockVerificationResult);
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Citation & Fact Verifier
          </h1>
          <p className="text-gray-600">
            Detect hallucinations, verify citations, and check factual claims in AI-generated content
          </p>
        </div>

        <InputForm 
          onSubmit={handleVerification}
          onClear={handleClear}
          loading={loading}
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-8">
            <LoadingSpinner />
          </div>
        )}

        {results && !loading && (
          <div className="mt-8">
            <ResultsDisplay results={results} />
          </div>
        )}
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Built for ByteQuest 2025 Hackathon</p>
        </div>
      </footer>
    </div>
  );
}

export default App;