import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Activity, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500 py-10">Failed to load dashboard data.</div>;
  }

  const pieData = [
    { name: 'Healthy', value: stats.healthyPredictions },
    { name: 'Diseased', value: stats.diseasedPredictions }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Analytics Dashboard</h1>
        <p className="text-gray-500">Overview of your plant disease predictions.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Predictions</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalPredictions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Healthy Plants</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.healthyPredictions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Diseased Plants</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.diseasedPredictions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Confidence</p>
            <h3 className="text-3xl font-bold text-gray-800">{(stats.averageConfidence * 100).toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Healthy vs Diseased */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Health Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <RechartsTooltip formatter={(value) => [value, 'Predictions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-gray-600">Healthy ({stats.healthyPredictions})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Diseased ({stats.diseasedPredictions})</span>
            </div>
          </div>
        </div>

        {/* Top Plants */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Predictions by Plant</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.predictionsByPlant.sort((a,b) => b.value - a.value).slice(0, 7)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {
                    stats.predictionsByPlant.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
