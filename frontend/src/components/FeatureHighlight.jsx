import { motion } from 'framer-motion';
import { CheckCircle, Search, Link as LinkIcon, FileText, Zap, Shield } from 'lucide-react';

function FeatureHighlight() {
  const features = [
    {
      icon: <Search size={24} />,
      title: 'Citation Verification',
      description: 'Cross-reference citations with CrossRef, PubMed, and Semantic Scholar databases',
      color: 'bg-blue-500'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Fact Checking',
      description: 'Verify factual claims using AI-powered evidence retrieval and analysis',
      color: 'bg-green-500'
    },
    {
      icon: <LinkIcon size={24} />,
      title: 'Link Validation',
      description: 'Check URL accessibility and find archived versions via Wayback Machine',
      color: 'bg-purple-500'
    },
    {
      icon: <FileText size={24} />,
      title: 'Document Support',
      description: 'Upload and verify PDF, DOCX, DOC, and TXT documents',
      color: 'bg-amber-500'
    },
    {
      icon: <Zap size={24} />,
      title: 'Fast Processing',
      description: 'Get comprehensive verification results in seconds',
      color: 'bg-red-500'
    },
    {
      icon: <Shield size={24} />,
      title: 'Trust Score',
      description: 'Visual trust score with detailed breakdown of verification results',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={`${feature.color} text-white p-3 rounded-lg inline-block mb-3`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default FeatureHighlight;