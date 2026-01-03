import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import SkeletonLoader from './components/SkeletonLoader';
import Toast from './components/Toast';
import { mockVerificationResult } from './utils/mockData';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleVerification = async (data) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Use mock data for now - will be replaced with real API call
      setResults(mockVerificationResult);
      showToast('Verification completed successfully!', 'success');
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during verification';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
    showToast('Cleared successfully', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            AI Citation & Fact Verifier
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
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
            <p className="text-sm sm:text-base text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-8">
            <SkeletonLoader />
          </div>
        )}

        {results && !loading && (
          <div className="mt-8">
            <ResultsDisplay results={results} />
          </div>
        )}

        {!results && !loading && !error && (
          <div className="mt-12 text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Results Yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Paste text or upload a document to start verification
            </p>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 sm:py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm sm:text-base">Built for ByteQuest 2025 Hackathon • Team Tech Titans</p>
        </div>
      </footer>
    </div>
  );
}

export default App;