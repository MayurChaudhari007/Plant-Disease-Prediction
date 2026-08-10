import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Search, Filter, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const IMG_URL = 'http://localhost:5000';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/predictions`, {
        params: {
          query: search,
          plant: filterPlant,
          sort: sort
        }
      });
      let data = res.data;
      if (filterStatus === 'healthy') {
        data = data.filter(p => p.disease.toLowerCase() === 'healthy');
      } else if (filterStatus === 'diseased') {
        data = data.filter(p => p.disease.toLowerCase() !== 'healthy');
      }
      setPredictions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, filterPlant, filterStatus, sort]);

  const deletePrediction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prediction?")) return;
    try {
      await axios.delete(`${API_URL}/predictions/${id}`);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("WARNING: This will permanently delete all prediction records and their saved images.")) return;
    try {
      await axios.delete(`${API_URL}/predictions`);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Get unique plants for filter
  const uniquePlants = [...new Set(predictions.map(p => p.plant))].sort();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Prediction History</h1>
          <p className="text-gray-500">View and manage your past plant disease analyses.</p>
        </div>
        <button 
          onClick={clearHistory}
          disabled={predictions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <AlertTriangle size={18} />
          Clear History
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by plant or disease..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[140px]">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="diseased">Diseased</option>
            </select>
          </div>
          <div className="relative min-w-[140px]">
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="confidence_high">Highest Confidence</option>
              <option value="confidence_low">Lowest Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No predictions found</h3>
          <p className="text-gray-400">Upload a plant image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map(p => (
            <div key={p._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                <img 
                  src={`${IMG_URL}/${p.imagePath}`} 
                  alt={p.plant} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found' }}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                  {(p.confidence * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{p.plant}</p>
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={p.disease}>{p.disease}</h3>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-4 mt-auto pt-4">
                  <Calendar size={14} className="mr-1" />
                  {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => deletePrediction(p._id)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link 
                    to={`/history/${p._id}`}
                    className="flex items-center text-sm font-medium text-primary hover:text-secondary px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Details <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
