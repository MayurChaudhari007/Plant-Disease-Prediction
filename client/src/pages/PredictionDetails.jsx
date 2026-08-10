import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Trash2, Calendar, AlertCircle, CheckCircle, Leaf } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const API_URL = 'http://localhost:5000/api';
const IMG_URL = 'http://localhost:5000';

const PredictionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await axios.get(`${API_URL}/predictions/${id}`);
        setData(res.data);
      } catch (err) {
        setError('Prediction not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [id]);

  const deletePrediction = async () => {
    if (!window.confirm("Are you sure you want to delete this prediction?")) return;
    try {
      await axios.delete(`${API_URL}/predictions/${id}`);
      navigate('/history');
    } catch (err) {
      alert("Failed to delete prediction.");
    }
  };

  const exportPDF = () => {
    const element = reportRef.current;
    
    // Temporarily adjust styles for better PDF output if needed
    const opt = {
      margin:       10,
      filename:     `Prediction_Report_${data.prediction.plant}_${new Date().toISOString().slice(0,10)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-2xl mx-auto">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
        <Link to="/history" className="text-primary hover:underline">Return to History</Link>
      </div>
    );
  }

  const { prediction, details } = data;
  const isHealthy = prediction.disease.toLowerCase() === 'healthy';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/history" className="flex items-center text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={18} className="mr-1" /> Back to History
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={deletePrediction}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center px-4 py-2 bg-primary text-white hover:bg-secondary rounded-lg font-medium transition-colors shadow-sm shadow-primary/20"
          >
            <Download size={16} className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* PDF Export Container */}
      <div ref={reportRef} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print-container">
        {/* Report Header (Visible in UI and PDF) */}
        <div className="bg-dark text-white p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Plant Disease Report</h1>
              <p className="text-gray-400 flex items-center">
                <Calendar size={16} className="mr-2" />
                {new Date(prediction.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Leaf size={20} className="text-primary" />
              <span className="font-bold tracking-widest text-primary">PlantAI</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Main Info */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="w-full md:w-1/3">
              <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 aspect-square">
                <img 
                  src={`${IMG_URL}/${prediction.imagePath}`} 
                  alt="Prediction" 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous" 
                />
              </div>
              <p className="text-xs text-center text-gray-400 mt-2 truncate px-2" title={prediction.originalFileName}>
                File: {prediction.originalFileName}
              </p>
            </div>

            <div className="w-full md:w-2/3 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{prediction.plant}</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                {isHealthy ? (
                  <CheckCircle size={32} className="text-green-500 shrink-0" />
                ) : (
                  <AlertCircle size={32} className="text-red-500 shrink-0" />
                )}
                <h2 className="text-4xl font-bold text-gray-800">{prediction.disease}</h2>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-gray-500">AI Confidence</span>
                  <span className="text-2xl font-bold text-dark">{(prediction.confidence * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${prediction.confidence * 100}%` }}></div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Top Alternative Predictions</span>
                  {prediction.topPredictions.slice(1).map((p, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-t border-gray-100 last:border-b-0">
                      <span className="text-gray-600 truncate pr-4">{p.className.replace(/___/g, ' - ').replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-500 shrink-0">{(p.confidence * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Disease Details */}
          {!isHealthy && details && Object.keys(details).length > 0 && (
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Disease Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="flex items-center text-lg font-bold text-gray-800 mb-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> Symptoms
                  </h4>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    {details.symptoms?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                
                <div>
                  <h4 className="flex items-center text-lg font-bold text-gray-800 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Severity
                  </h4>
                  <div className="inline-block px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-lg">
                    {details.severity || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="flex items-center text-lg font-bold text-blue-800 mb-3">
                    <CheckCircle size={18} className="mr-2" /> Recommended Actions
                  </h4>
                  <ul className="space-y-2 text-blue-900/80 list-disc list-inside">
                    {details.recommendedActions?.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <h4 className="flex items-center text-lg font-bold text-green-800 mb-3">
                    <Leaf size={18} className="mr-2" /> Prevention
                  </h4>
                  <ul className="space-y-2 text-green-900/80 list-disc list-inside">
                    {details.prevention?.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isHealthy && (
            <div className="border-t border-gray-100 pt-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plant is Healthy</h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                No disease symptoms were detected by the AI model. Continue your current care routine to maintain plant health.
              </p>
            </div>
          )}
          
          <div className="mt-12 text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            Generated by PlantAI Local Disease Recognition System - {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetails;
