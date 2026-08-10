import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Activity, Clock, BookOpen, BarChart2, Info } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: 'Detect', path: '/detect', icon: <Activity size={18} /> },
    { name: 'History', path: '/history', icon: <Clock size={18} /> },
    { name: 'Library', path: '/library', icon: <BookOpen size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 size={18} /> },
    { name: 'About', path: '/about', icon: <Info size={18} /> },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Leaf className="text-primary" />
            <span>PlantAI</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === link.path 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
