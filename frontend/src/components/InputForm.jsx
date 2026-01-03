function InputForm({ onSubmit, onClear, loading }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Input Form</h2>
      <p className="text-gray-500">Component will be built in Phase 3</p>
      
      {/* Temporary test button */}
      <button
        onClick={() => onSubmit({ text: "test" })}
        disabled={loading}
        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Test Verify
      </button>
    </div>
  );
}

export default InputForm;