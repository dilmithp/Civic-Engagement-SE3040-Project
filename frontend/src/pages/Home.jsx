import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-700 rounded-lg shadow-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">C</span>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">CivicEngage</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 hover:text-purple-700 font-medium transition-colors">
                Log In
              </Link>
              <Link to="/register" className="bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-800 transition-colors shadow-sm shadow-purple-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
            Shape the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-500">your community.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A modern platform for citizens, officials, and administrators to collaborate, report issues, and participate in urban planning.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/register" className="bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-800 transition-colors shadow-lg shadow-purple-200">
              Join the Platform
            </Link>
            <Link to="/login" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 hover:text-purple-700 transition-colors shadow-sm">
              Access Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🌱</div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Green Initiatives</h3>
            <p className="text-slate-600">Propose and track environmental projects in your neighborhood.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🗺️</div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Urban Planning</h3>
            <p className="text-slate-600">Participate in community surveys and directly influence zoning boards.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">⚡</div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Issue Reporting</h3>
            <p className="text-slate-600">Report potholes, broken lights, and hazards directly to officials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
