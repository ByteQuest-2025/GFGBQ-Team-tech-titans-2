import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Statistics from './Statistics';

function TrustScoreCard({ results }) {
  const { trust_score, metadata } = results;
  const scorePercentage = Math.round(trust_score * 100);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-verified';
    if (score >= 0.5) return 'text-suspicious';
    return 'text-fake';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'High Trust';
    if (score >= 0.5) return 'Medium Trust';
    return 'Low Trust';
  };

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference * (1 - trust_score);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-2xl p-6 mb-6 border border-gray-100"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
            {/* Animated progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              stroke={getScoreBgColor(trust_score)}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            <span className={`text-5xl font-bold ${getScoreColor(trust_score)}`}>
              {scorePercentage}%
            </span>
            <span className="text-sm text-gray-600 mt-1">{getScoreLabel(trust_score)}</span>
          </motion.div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Statistics metadata={metadata} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verified */}
        <motion.div 
          className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="text-verified" size={20} />
            <motion.span 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {metadata.verified_citations}
            </motion.span>
          </div>
          <p className="text-sm text-gray-600">Verified</p>
        </motion.div>

        {/* Suspicious */}
        <motion.div 
          className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="text-suspicious" size={20} />
            <motion.span 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {metadata.suspicious_citations}
            </motion.span>
          </div>
          <p className="text-sm text-gray-600">Suspicious</p>
        </motion.div>

        {/* Fake */}
        <motion.div 
          className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <XCircle className="text-fake" size={20} />
            <motion.span 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {metadata.fake_citations}
            </motion.span>
          </div>
          <p className="text-sm text-gray-600">Fake</p>
        </motion.div>
      </div>

      {/* Processing Info */}
      <motion.div 
        className="mt-6 pt-6 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex flex-wrap justify-between text-sm text-gray-600 gap-2">
          <span>Processing Time: {metadata.processing_time}s</span>
          <span>Total Citations: {metadata.total_citations}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TrustScoreCard;