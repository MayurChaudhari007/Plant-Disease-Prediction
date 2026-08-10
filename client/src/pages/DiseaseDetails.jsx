import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Shield, Droplets } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const DiseaseDetails = () => {
  const { className } = useParams();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDisease = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/diseases/${encodeURIComponent(className)}`);
      setDisease(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('not_found');
      } else {
        setError('error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisease();
  }, [className]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <Info size={40} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-dark mb-4">Disease Not Found</h2>
        <p className="text-gray-600 mb-8">The requested disease information could not be found.</p>
        <Link to="/library" className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Disease Library
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-dark mb-4">Unable to load information</h2>
        <p className="text-gray-600 mb-8">There was an error retrieving the disease details.</p>
        <div className="flex justify-center gap-4">
          <Link to="/library" className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-colors">
            Back to Library
          </Link>
          <button onClick={fetchDisease} className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-secondary transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!disease) return null;

  const isHealthy = disease.disease.toLowerCase() === 'healthy';

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link to="/library" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-6 font-medium">
        <ArrowLeft size={20} className="mr-2" />
        Back to Library
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header section */}
        <div className={`p-8 md:p-10 text-white ${isHealthy ? 'bg-green-600' : 'bg-dark'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              {disease.plant}
            </span>
            {isHealthy && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                <CheckCircle size={14} /> Healthy
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{disease.disease}</h1>
          
          {!isHealthy && (
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                disease.severity?.toLowerCase().includes('high') ? 'bg-red-500 text-white' : 
                disease.severity?.toLowerCase().includes('low') ? 'bg-yellow-500 text-dark' : 
                'bg-orange-500 text-white'
              }`}>
                Severity: {disease.severity || 'Unknown'}
              </span>
            </div>
          )}
        </div>

        <div className="p-8 md:p-10 space-y-10">
          {isHealthy ? (
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" /> Status
                </h3>
                <p className="text-gray-700 leading-relaxed bg-green-50 p-6 rounded-2xl border border-green-100">
                  Healthy Plant. No disease symptoms associated with this class.
                </p>
              </section>
              
              {disease.recommendedActions && disease.recommendedActions.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Droplets className="text-blue-500" /> General Care
                  </h3>
                  <ul className="space-y-3">
                    {disease.recommendedActions.map((action, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-blue-500 font-bold">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              
              {disease.prevention && disease.prevention.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="text-purple-500" /> Maintenance
                  </h3>
                  <ul className="space-y-3">
                    {disease.prevention.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-purple-500 font-bold">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          ) : (
            <>
              {/* Symptoms */}
              {disease.symptoms && disease.symptoms.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" /> Symptoms
                  </h3>
                  <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50">
                    <ul className="space-y-3">
                      {disease.symptoms.map((symptom, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-orange-500 font-bold">•</span>
                          <span className="text-gray-700 leading-relaxed">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* Actions */}
                {disease.recommendedActions && disease.recommendedActions.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Droplets className="text-blue-500" /> Recommended Actions
                    </h3>
                    <ul className="space-y-3">
                      {disease.recommendedActions.map((action, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="text-gray-700 leading-relaxed">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Prevention */}
                {disease.prevention && disease.prevention.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Shield className="text-purple-500" /> Prevention
                    </h3>
                    <ul className="space-y-3">
                      {disease.prevention.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-purple-500 font-bold">•</span>
                          <span className="text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetails;
