import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

function FileUpload({ file, setFile, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const allowedTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'text/plain': '.txt'
  };

  const maxSize = 10 * 1024 * 1024;

  const validateFile = (selectedFile) => {
    setError('');

    if (!allowedTypes[selectedFile.type]) {
      setError('Invalid file type. Please upload PDF, DOCX, DOC, or TXT files only.');
      return false;
    }

    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  const handleFile = (selectedFile) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Document (PDF, DOCX, DOC, TXT)
      </label>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="file"
              onChange={handleChange}
              accept=".pdf,.docx,.doc,.txt"
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            <motion.div
              animate={{ y: dragActive ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            </motion.div>
            
            <p className="text-gray-700 font-medium mb-2">
              Drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: PDF, DOCX, DOC, TXT (Max 10MB)
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="bg-primary text-white p-2 rounded"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <File size={24} />
                </motion.div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileUpload;