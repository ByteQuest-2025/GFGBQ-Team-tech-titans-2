import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

function TrustScoreCard({ results }) {
  const { trust_score, metadata } = results;
  const scorePercentage = Math.round(trust_score * 100);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-verified';
    if (score >= 0.5) return 'text-suspicious';
    return 'text-fake';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return 'bg-verified';
    if (score >= 0.5) return 'bg-suspicious';
    return 'bg-fake';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'High Trust';
    if (score >= 0.5) return 'Medium Trust';
    return 'Low Trust';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-primary" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Verification Results</h2>
      </div>

      {/* Trust Score Circle */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <svg className="transform -rotate-90" width="200" height="200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke={trust_score >= 0.8 ? '#10b981' : trust_score >= 0.5 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - trust_score)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getScoreColor(trust_score)}`}>
              {scorePercentage}%
            </span>
            <span className="text-sm text-gray-600 mt-1">{getScoreLabel(trust_score)}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {/* Citations */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="text-verified" size={20} />
            <span className="text-2xl font-bold text-gray-900">
              {metadata.verified_citations}
            </span>
          </div>
          <p className="text-sm text-gray-600">Verified</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="text-suspicious" size={20} />
            <span className="text-2xl font-bold text-gray-900">
              {metadata.suspicious_citations}
            </span>
          </div>
          <p className="text-sm text-gray-600">Suspicious</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <XCircle className="text-fake" size={20} />
            <span className="text-2xl font-bold text-gray-900">
              {metadata.fake_citations}
            </span>
          </div>
          <p className="text-sm text-gray-600">Fake</p>
        </div>
      </div>

      {/* Processing Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Processing Time: {metadata.processing_time}s</span>
          <span>Total Citations: {metadata.total_citations}</span>
        </div>
      </div>
    </div>
  );
}

export default TrustScoreCard;