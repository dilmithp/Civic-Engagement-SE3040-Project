import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, HeartHandshake, Trees, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-primary-50 font-sans selection:bg-primary-200">
      
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-primary-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-bold text-lg text-primary-900 tracking-tight">CivicConnect</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-primary-700">
            <Link to="/" className="text-primary-600 font-semibold">Home</Link>
            <Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
            <Link to="/dashboard/marketplace" className="hover:text-primary-600 transition-colors">Marketplace</Link>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">Login</Link>
            <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-primary-500"></span>
          CivicConnect Version 2.0 is Live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary-900 tracking-tight max-w-4xl leading-tight mb-8">
          Empowering citizens to shape <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">better cities</span>
        </h1>
        <p className="text-lg text-primary-600 max-w-2xl mb-10 leading-relaxed font-medium">
          Participate in urban planning, connect with local officials, and monitor the health of your community in real-time. The future of sustainability starts with your voice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105">
            Join Your Community <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="px-8 py-3.5 bg-white text-primary-700 border border-primary-200 font-bold rounded-xl hover:bg-primary-50 hover:border-primary-300 flex items-center justify-center gap-2 transition-all">
            Learn More
          </Link>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 bg-white border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Core Platform Pillars</h2>
            <p className="text-primary-500 max-w-2xl mx-auto">Our toolkit provides everything needed to foster transparent, sustainable, and rapid civic development.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 hover:border-primary-300 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-primary-600 flex items-center justify-center mb-6">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Participatory Surveys</h3>
              <p className="text-primary-600 leading-relaxed">Let your voice be heard on crucial community projects. Vote on expansions, renovations, and town zoning changes directly.</p>
            </div>
            
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 hover:border-primary-300 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-primary-600 flex items-center justify-center mb-6">
                <Trees size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Green Initiatives</h3>
              <p className="text-primary-600 leading-relaxed">Launch and monitor sustainable projects. Track key environmental performance metrics and gather volunteer aid.</p>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 hover:border-primary-300 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-primary-600 flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Issue Reporting</h3>
              <p className="text-primary-600 leading-relaxed">Report and track municipal problems in real time. Our officials dashboard maps out concerns for rapid deployment responses.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-900 py-12 text-primary-300 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <Shield size={20} className="text-primary-400" /> CivicConnect
          </div>
          <div className="text-sm">© 2026 CivicConnect SE3040. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
