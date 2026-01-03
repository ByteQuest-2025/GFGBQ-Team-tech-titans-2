import { useState } from 'react';
import { Upload, FileText, X, Sparkles } from 'lucide-react';
import FileUpload from './FileUpload';

function InputForm({ onSubmit, onClear, loading }) {
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputMode === 'text' && text.trim()) {
      onSubmit({ text, type: 'text' });
    } else if (inputMode === 'file' && file) {
      onSubmit({ file, type: 'file' });
    }
  };

  const handleClearForm = () => {
    setText('');
    setFile(null);
    onClear();
  };

  const loadExampleText = () => {
    const exampleText = `According to Smith et al. (2023), artificial intelligence models often produce hallucinations when generating factual content. Recent research by Johnson (2024) demonstrates that 35% of AI-generated citations are completely fabricated.

The study published in Nature Communications (DOI: 10.1038/example) shows that verification systems can reduce hallucination rates by up to 60%. However, as noted by Chen and Lee (2023) in their paper "AI Reliability Challenges," these systems are not foolproof.

For more information, visit: https://example-research.com/ai-hallucinations`;
    
    setText(exampleText);
    setInputMode('text');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setInputMode('text')}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === 'text'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <FileText size={18} />
          Paste Text
        </button>
        <button
          onClick={() => setInputMode('file')}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === 'file'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <Upload size={18} />
          Upload File
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste AI-generated text to verify
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your AI-generated content here. Include any citations, references, or factual claims you want to verify..."
              disabled={loading}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {text.length} characters
              </span>
              <button
                type="button"
                onClick={loadExampleText}
                disabled={loading}
                className="text-sm text-primary hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles size={14} />
                Load Example
              </button>
            </div>
          </div>
        )}

        {/* File Upload Mode */}
        {inputMode === 'file' && (
          <FileUpload
            file={file}
            setFile={setFile}
            loading={loading}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading || (inputMode === 'text' && !text.trim()) || (inputMode === 'file' && !file)}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Citations & Facts'}
          </button>
          
          <button
            type="button"
            onClick={handleClearForm}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <X size={18} />
            Clear
          </button>
        </div>
      </form>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> This tool will verify citations, check factual claims, and validate URLs in your content.
        </p>
      </div>
    </div>
  );
}

export default InputForm;
