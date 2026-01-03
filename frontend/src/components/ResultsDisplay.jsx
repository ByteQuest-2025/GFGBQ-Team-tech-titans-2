import { motion } from 'framer-motion';
import TrustScoreCard from './TrustScoreCard';
import CitationCard from './CitationCard';
import FactCheckCard from './FactCheckCard';
import LinkVerificationCard from './LinkVerificationCard';
import ExportButton from './ExportButton';
import { FileText, Link, CheckSquare } from 'lucide-react';

function ResultsDisplay({ results }) {
  const { results: data } = results;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Trust Score */}
      <motion.div variants={itemVariants}>
        <TrustScoreCard results={results} />
      </motion.div>

      {/* Export Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <ExportButton results={results} />
      </motion.div>

      {/* Citations Section */}
      {data.citations && data.citations.length > 0 && (
        <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Citations ({data.citations.length})
            </h3>
          </div>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.citations.map((citation, index) => (
              <motion.div
                key={citation.id}
                variants={itemVariants}
                custom={index}
              >
                <CitationCard citation={citation} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Facts Section */}
      {data.facts && data.facts.length > 0 && (
        <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Fact Checks ({data.facts.length})
            </h3>
          </div>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.facts.map((fact, index) => (
              <motion.div
                key={fact.id}
                variants={itemVariants}
                custom={index}
              >
                <FactCheckCard fact={fact} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Links Section */}
      {data.links && data.links.length > 0 && (
        <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Links ({data.links.length})
            </h3>
          </div>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.links.map((link, index) => (
              <motion.div
                key={link.id}
                variants={itemVariants}
                custom={index}
              >
                <LinkVerificationCard link={link} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ResultsDisplay;