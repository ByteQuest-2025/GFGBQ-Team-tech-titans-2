import { AlertCircle, X } from 'lucide-react';

function ErrorMessage({ message, onClose }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <h4 className="font-medium text-red-900 mb-1">Error</h4>
        <p className="text-sm text-red-800">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;