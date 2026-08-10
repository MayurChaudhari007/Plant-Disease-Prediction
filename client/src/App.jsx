import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DiseaseDetection from './pages/DiseaseDetection';
import History from './pages/History';
import PredictionDetails from './pages/PredictionDetails';
import Library from './pages/Library';
import DiseaseDetails from './pages/DiseaseDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-light">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/detect" element={<DiseaseDetection />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<PredictionDetails />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:className" element={<DiseaseDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
