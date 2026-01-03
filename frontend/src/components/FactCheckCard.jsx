import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function FactCheckCard({ fact }) {
  const [expanded, setExpanded] = useState(false);

  const getVerdictIcon = (verdict) => {
    if (verdict === 'true') return <CheckCircle className="text-verified" size={20} />;
    if (verdict === 'false') return <XCircle className="text-fake" size={20} />;
    if (verdict === 'mixed') return <AlertCircle className="text-suspicious" size={20} />;
    return null;
  };

  const getVerdictBadge = (verdict) => {
    const config = {
      true: { style: 'bg-green-100 text-green-800 border-green-200', label: 'True' },
      false: { style: 'bg-red-100 text-red-800 border-red-200', label: 'False' },
      mixed: { style: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Mixed / Unclear' }
    };
    const item = config[verdict];
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.style}`}>{item.label}</span>;
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'true') return 'border-l-verified';
    if (verdict === 'false') return 'border-l-fake';
    if (verdict === 'mixed') return 'border-l-suspicious';
    return 'border-l-gray-300';
  };

  return (
    <motion.div 
      className={`bg-white rounded-lg border-l-4 ${getVerdictColor(fact.verdict)} shadow-sm p-4 mb-3`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {getVerdictIcon(fact.verdict)}
          <div className="flex-1">
            <p className="font-medium text-gray-900">"{fact.claim}"</p>
            <p className="text-sm text-gray-500 mt-1">Confidence: {Math.round(fact.confidence * 100)}%</p>
          </div>
        </div>
        {getVerdictBadge(fact.verdict)}
      </div>

      <div className="mt-3 pl-8">
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Hide Evidence' : 'Show Evidence'}
        </motion.button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div 
              className="mt-3 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {fact.evidence && fact.evidence.length > 0 && (
                <motion.div 
                  className="p-3 bg-blue-50 rounded"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-sm font-medium text-gray-900 mb-2">Supporting Evidence:</p>
                  <ul className="space-y-1">
                    {fact.evidence.map((item, index) => (
                      <motion.li 
                        key={index} 
                        className="text-sm text-gray-700 flex gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {fact.sources && fact.sources.length > 0 && (
                <motion.div 
                  className="p-3 bg-gray-50 rounded"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm font-medium text-gray-900 mb-2">Sources:</p>
                  <ul className="space-y-1">
                    {fact.sources.map((source, index) => (
                      <motion.li 
                        key={index} 
                        className="text-sm text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {source}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default FactCheckCard;