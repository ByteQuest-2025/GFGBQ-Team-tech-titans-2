import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function CitationCard({ citation }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status) => {
    if (status === 'verified') return <CheckCircle className="text-verified" size={20} />;
    if (status === 'fake') return <XCircle className="text-fake" size={20} />;
    if (status === 'suspicious') return <AlertTriangle className="text-suspicious" size={20} />;
    return null;
  };

  const getStatusBadge = (status) => {
    const config = {
      verified: { style: 'bg-green-100 text-green-800 border-green-200', label: 'Verified' },
      fake: { style: 'bg-red-100 text-red-800 border-red-200', label: 'Fake' },
      suspicious: { style: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Suspicious' }
    };
    const item = config[status];
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.style}`}>{item.label}</span>;
  };

  const getStatusColor = (status) => {
    if (status === 'verified') return 'border-l-verified';
    if (status === 'fake') return 'border-l-fake';
    if (status === 'suspicious') return 'border-l-suspicious';
    return 'border-l-gray-300';
  };

  return (
    <motion.div 
      className={`bg-white rounded-lg border-l-4 ${getStatusColor(citation.status)} shadow-sm p-4 mb-3`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon(citation.status)}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{citation.citation_text}</p>
            <p className="text-sm text-gray-500 mt-1">Confidence: {Math.round(citation.confidence * 100)}%</p>
          </div>
        </div>
        {getStatusBadge(citation.status)}
      </div>

      {citation.status === 'verified' && citation.details && (
        <motion.div 
          className="mt-3 pl-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm space-y-1">
            <p className="text-gray-700"><span className="font-medium">Title:</span> {citation.details.title}</p>
            {citation.details.authors && (
              <p className="text-gray-700"><span className="font-medium">Authors:</span> {citation.details.authors.join(', ')}</p>
            )}
            <p className="text-gray-700"><span className="font-medium">Source:</span> {citation.details.source} ({citation.details.year})</p>
            {citation.details.doi && (
              <p className="text-gray-700"><span className="font-medium">DOI:</span> {citation.details.doi}</p>
            )}
            {citation.details.url && (
              <motion.a 
                href={citation.details.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-primary hover:text-blue-700 font-medium mt-2"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                View Paper <ExternalLink size={14} />
              </motion.a>
            )}
          </div>
        </motion.div>
      )}

      {(citation.status === 'fake' || citation.status === 'suspicious') && citation.details && (
        <div className="mt-3 pl-8">
          <motion.button 
            onClick={() => setExpanded(!expanded)} 
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Hide Details' : 'Show Details'}
          </motion.button>
          <AnimatePresence>
            {expanded && (
              <motion.div 
                className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-700"><span className="font-medium">Reason:</span> {citation.details.reason}</p>
                {citation.details.searched_databases && (
                  <p className="text-gray-700"><span className="font-medium">Searched:</span> {citation.details.searched_databases.join(', ')}</p>
                )}
                {citation.details.note && <p className="text-gray-600 italic">{citation.details.note}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default CitationCard;