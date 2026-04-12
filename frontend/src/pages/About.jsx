import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-primary-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <Link to="/" className="font-bold text-lg text-primary-900 tracking-tight">CivicConnect</Link>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-primary-700">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/about" className="text-primary-600 font-semibold">About Us</Link>
            <Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
            <Link to="/dashboard/marketplace" className="hover:text-primary-600 transition-colors">Marketplace</Link>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-900 tracking-tight mb-6">About CivicConnect</h1>
        <div className="h-1.5 w-20 bg-primary-500 rounded-full mb-10"></div>
        
        <p className="text-lg text-primary-700 leading-relaxed mb-8">
          CivicConnect is a next-generation platform designed to bridge the gap between citizens, elected officials, and civil servants. Born out of the necessity for transparent governance, our mission is to provide an ecosystem where sustainable city development happens collectively, in real-time.
        </p>
        <p className="text-lg text-primary-700 leading-relaxed mb-12">
          By aligning with UN Sustainable Development Goal 11 (Sustainable Cities and Communities), we ensure that every active module on our platform directly contributes to the greening, safety, and functionality of urban environments.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
            <Users className="text-primary-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-primary-900 mb-2">For Citizens</h3>
            <p className="text-primary-600">Empower yourself by directly reviewing city proposals, casting immutable votes, reporting infrastructure decay, and finding local green volunteering events in a central hub.</p>
          </div>
          <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
            <Shield className="text-primary-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-primary-900 mb-2">For Officials</h3>
            <p className="text-primary-600">Eliminate data silos. Launch participative surveys in minutes, generate live constituent feedback analytics, and triage civic issues with automated routing logic.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
