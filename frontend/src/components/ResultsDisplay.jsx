function ResultsDisplay({ results }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Results</h2>
      <p className="text-gray-500">Component will be built in Phase 5</p>
      <pre className="mt-4 p-4 bg-gray-50 rounded text-xs overflow-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}

export default ResultsDisplay;