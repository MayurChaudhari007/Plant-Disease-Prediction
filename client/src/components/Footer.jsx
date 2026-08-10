import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Leaf className="text-primary" size={20} />
          <span className="font-semibold text-gray-700">PlantAI Disease Recognition</span>
        </div>
        <p>Local AI Model Inference</p>
      </div>
    </footer>
  );
};

export default Footer;
