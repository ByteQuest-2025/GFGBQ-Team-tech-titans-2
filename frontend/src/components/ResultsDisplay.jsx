import TrustScoreCard from './TrustScoreCard';
import CitationCard from './CitationCard';
import FactCheckCard from './FactCheckCard';
import LinkVerificationCard from './LinkVerificationCard';
import ExportButton from './ExportButton';
import { FileText, Link, CheckSquare } from 'lucide-react';

function ResultsDisplay({ results }) {
  const { results: data } = results;

  return (
    <div className="space-y-6">
      {/* Trust Score */}
      <TrustScoreCard results={results} />

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton results={results} />
      </div>

      {/* Citations Section */}
      {data.citations && data.citations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Citations ({data.citations.length})
            </h3>
          </div>
          <div className="space-y-3">
            {data.citations.map((citation) => (
              <CitationCard key={citation.id} citation={citation} />
            ))}
          </div>
        </div>
      )}

      {/* Facts Section */}
      {data.facts && data.facts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Fact Checks ({data.facts.length})
            </h3>
          </div>
          <div className="space-y-3">
            {data.facts.map((fact) => (
              <FactCheckCard key={fact.id} fact={fact} />
            ))}
          </div>
        </div>
      )}

      {/* Links Section */}
      {data.links && data.links.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Links ({data.links.length})
            </h3>
          </div>
          <div className="space-y-3">
            {data.links.map((link) => (
              <LinkVerificationCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;