import { Shield } from 'lucide-react';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Citation Verifier
              </h1>
              <p className="text-sm text-gray-500">
                AI Hallucination Detection System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Team Tech Titans
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;