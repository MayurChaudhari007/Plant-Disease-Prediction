import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, UploadCloud, Cpu, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
            <Leaf size={18} />
            <span>AI-Powered Plant Disease Detection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6 leading-tight">
            Protect your crops with <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Deep Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Upload a plant leaf image and let our advanced local AI model identify potential diseases in seconds. Supports 38 different plant and disease combinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/detect" className="px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/30 hover:bg-secondary transition-all hover:-translate-y-1">
              Detect Disease
            </Link>
            <Link to="/library" className="px-8 py-4 bg-white text-dark font-semibold rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 transition-all">
              Explore Diseases
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="w-full py-16 bg-white rounded-3xl shadow-sm border border-gray-100 mt-10 px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">How It Works</h2>
          <p className="text-gray-500">Four simple steps to healthier plants</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <UploadCloud size={32} />, title: '1. Upload', desc: 'Securely upload a photo of a single plant leaf.' },
            { icon: <Cpu size={32} />, title: '2. AI Analysis', desc: 'Our TensorFlow CNN model analyzes the image locally.' },
            { icon: <ShieldCheck size={32} />, title: '3. Prediction', desc: 'Get accurate disease identification and confidence score.' },
            { icon: <Leaf size={32} />, title: '4. Action', desc: 'View detailed symptoms, treatments, and prevention tips.' },
          ].map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-light rounded-2xl"
            >
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
