import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function ExportButton({ results }) {
  const [copied, setCopied] = useState(false);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyResults = async () => {
    const text = generateTextSummary(results);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateTextSummary = (results) => {
    const { trust_score, results: data, metadata } = results;
    
    let summary = `AI CITATION & FACT VERIFICATION REPORT\n`;
    summary += `Generated: ${new Date().toLocaleString()}\n`;
    summary += `${'='.repeat(50)}\n\n`;
    
    summary += `TRUST SCORE: ${Math.round(trust_score * 100)}%\n\n`;
    
    summary += `SUMMARY:\n`;
    summary += `- Total Citations: ${metadata.total_citations}\n`;
    summary += `- Verified: ${metadata.verified_citations}\n`;
    summary += `- Suspicious: ${metadata.suspicious_citations}\n`;
    summary += `- Fake: ${metadata.fake_citations}\n`;
    summary += `- Processing Time: ${metadata.processing_time}s\n\n`;
    
    if (data.citations && data.citations.length > 0) {
      summary += `CITATIONS:\n`;
      summary += `${'-'.repeat(50)}\n`;
      data.citations.forEach((citation, index) => {
        summary += `${index + 1}. ${citation.citation_text}\n`;
        summary += `   Status: ${citation.status.toUpperCase()}\n`;
        summary += `   Confidence: ${Math.round(citation.confidence * 100)}%\n\n`;
      });
    }
    
    if (data.facts && data.facts.length > 0) {
      summary += `\nFACT CHECKS:\n`;
      summary += `${'-'.repeat(50)}\n`;
      data.facts.forEach((fact, index) => {
        summary += `${index + 1}. "${fact.claim}"\n`;
        summary += `   Verdict: ${fact.verdict.toUpperCase()}\n`;
        summary += `   Confidence: ${Math.round(fact.confidence * 100)}%\n\n`;
      });
    }
    
    return summary;
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCopyResults}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
        {copied ? 'Copied!' : 'Copy Summary'}
      </button>
      
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        <Download size={18} />
        Export JSON
      </button>
    </div>
  );
}

export default ExportButton;