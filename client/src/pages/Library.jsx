import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Library = () => {
  const [diseases, setDiseases] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plantFilter, setPlantFilter] = useState('');

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const res = await axios.get(`${API_URL}/diseases`);
        setDiseases(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error fetching diseases library", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiseases();
  }, []);

  useEffect(() => {
    let result = diseases;
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.plant.toLowerCase().includes(q) || 
        d.disease.toLowerCase().includes(q)
      );
    }
    
    if (plantFilter) {
      result = result.filter(d => d.plant === plantFilter);
    }
    
    setFiltered(result);
  }, [search, plantFilter, diseases]);

  const uniquePlants = [...new Set(diseases.map(d => d.plant))].sort();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-dark mb-2">Disease Library</h1>
        <p className="text-gray-500">Comprehensive information on 38 plant and disease combinations</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by plant or disease name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select 
            value={plantFilter} 
            onChange={(e) => setPlantFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Plants</option>
            {uniquePlants.map(plant => (
              <option key={plant} value={plant}>{plant}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(d => (
            <Link to={`/library/${encodeURIComponent(d.className)}`} key={d.className} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group cursor-pointer block">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{d.plant}</span>
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{d.disease}</h3>
              </div>
              
              <div className="mb-4 flex-grow">
                {d.disease.toLowerCase() === 'healthy' ? (
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">
                    Healthy Plant
                  </div>
                ) : (
                  <>
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-3">
                      Severity: {d.severity || 'Unknown'}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {d.symptoms?.[0]} {d.symptoms?.[1]}
                    </p>
                  </>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">View Details</span>
                <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
