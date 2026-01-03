import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function FactCheckCard({ fact }) {
  const [expanded, setExpanded] = useState(false);

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'true':
        return <CheckCircle className="text-verified" size={20} />;
      case 'false':
        return <XCircle className="text-fake" size={20} />;
      case 'mixed':
        return <AlertCircle className="text-suspicious" size={20} />;
      default:
        return null;
    }
  };

  const getVerdictBadge = (verdict) => {
    const styles = {
      true: 'bg-green-100 text-green-800 border-green-200',
      false: 'bg-red-100 text-red-800 border-red-200',
      mixed: 'bg-amber-100 text-amber-800 border-amber-200'
    };

    const labels = {
      true: 'True',
      false: 'False',
      mixed: 'Mixed / Unclear'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[verdict]}`}>
        {labels[verdict]}
      </span>
    );
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'true':
        return 'border-l-verified';
      case 'false':
        return 'border-l-fake';
      case 'mixed':
        return 'border-l-suspicious';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${getVerdictColor(fact.verdict)} shadow-sm p-4 mb-3`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {getVerdictIcon(fact.verdict)}
          <div className="flex-1">
            <p className="font-medium text-gray-900">"{fact.claim}"</p>
            <p className="text-sm text-gray-500 mt-1">
              Confidence: {Math.round(fact.confidence * 100)}%
            </p>
          </div>
        </div>
        {getVerdictBadge(fact.verdict)}
      </div>

      {/* Toggle Details */}
      <div className="mt-3 pl-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Hide Evidence' : 'Show Evidence'}
        </button>
        
        {expanded && (
          <div className="mt-3 space-y-3">
            {/* Evidence */}
            {fact.evidence && fact.evidence.length > 0 && (
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium text-gray-900 mb-2">Supporting Evidence:</p>
                <ul className="space-y-1">
                  {fact.evidence.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            {fact.sources && fact.sources.length > 0 && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-900 mb-2">Sources:</p>
                <ul className="space-y-1">
                  {fact.sources.map((source, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FactCheckCard;