import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, AlertCircle, CheckCircle, Leaf, Search } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const DiseaseDetection = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setError(null);
    setResult(null);
    
    if (!selectedFile.type.match('image.*')) {
      setError('Please upload a JPG, JPEG, or PNG image.');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setResult(null);
  };

  const analyzeImage = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_URL}/predictions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
    } catch (err) {
      if (err.response?.status === 500) {
        setError('The AI prediction service is currently unavailable. Please make sure the ML service is running.');
      } else {
        setError(err.response?.data?.error || 'We couldn\'t process this image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Disease Detection</h1>
        <p className="text-gray-500">Upload a plant leaf image to analyze for diseases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
          {!preview ? (
            <div 
              className="flex-grow border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:bg-gray-50 hover:border-primary transition-colors cursor-pointer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <UploadCloud size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Drag & drop your plant image here</h3>
              <p className="text-sm text-gray-500 mb-6">Supports JPG, JPEG, PNG (Max 10MB)</p>
              <button className="px-6 py-2 bg-primary/10 text-primary font-medium rounded-lg">
                Choose Image
              </button>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept="image/jpeg, image/png, image/jpg" 
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="flex-grow flex flex-col">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 flex-grow mb-4 min-h-[300px]">
                <img src={preview} alt="Preview" className="w-full h-full object-contain absolute inset-0" />
                <button 
                  onClick={clearSelection}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md backdrop-blur-sm transition-all"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
              </div>
              <button 
                onClick={analyzeImage}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-secondary hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <>
                    <Search className="animate-pulse" size={20} />
                    Analyzing image...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex gap-3 items-start"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8"
              >
                <Leaf size={64} className="mb-4 opacity-20" />
                <p>Upload and analyze an image to see results here.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Analyzing your plant image...</h3>
                <p className="text-gray-500 text-sm">Identifying disease patterns</p>
              </motion.div>
            )}

            {result && result.status === 'uncertain' && (
              <motion.div 
                key="uncertain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Unable to identify confidently</h3>
                <p className="text-gray-600 mb-6 px-4">
                  {result.message}
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-left w-full text-gray-600">
                  <p className="font-semibold mb-2 text-gray-700">Possible reasons:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Image may not contain a recognizable plant leaf.</li>
                    <li>Image may be too blurry.</li>
                    <li>Lighting may be poor.</li>
                    <li>Leaf may be too small in the image.</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {result && result.status === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  {result.prediction.disease.toLowerCase() === 'healthy' ? (
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                      <AlertCircle size={24} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{result.prediction.plant}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{result.prediction.disease}</h3>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">Confidence</span>
                    <span className="font-bold text-primary">{(result.prediction.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.prediction.confidence * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-primary h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Predictions</h4>
                  <div className="space-y-2">
                    {result.prediction.topPredictions.map((pred, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50">
                        <span className="text-gray-700 truncate pr-4">{pred.className.replace(/___/g, ' - ').replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-500 shrink-0">{(pred.confidence * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.details && result.prediction.disease.toLowerCase() !== 'healthy' && (
                  <div className="mt-auto bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <Leaf size={16} /> Recommended Action
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      {result.details.recommendedActions?.slice(0, 3).map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                    <a href={`/history/${result.prediction._id}`} className="inline-block mt-3 text-sm text-primary font-medium hover:underline">
                      View full details &rarr;
                    </a>
                  </div>
                )}
                
                {result.prediction.disease.toLowerCase() === 'healthy' && (
                  <div className="mt-auto bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-green-700 font-medium">This plant appears to be healthy. Keep up the good work!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
