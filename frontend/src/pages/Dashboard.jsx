import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome, <span className="text-purple-700">{user?.name || user?.email}</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">
              Role: {user?.role}
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors border border-red-200"
          >
            Logout
          </button>
        </header>

        <main className="grid gap-6">
          {/* CITIZEN DASHBOARD */}
          {user?.role === 'citizen' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Citizen Workspace</h3>
              <ul className="space-y-3">
                <li 
                  onClick={() => navigate('/dashboard/issues/create')}
                  className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700"
                >
                  Submit a new Issue
                </li>
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">View active Participatory Planning Surveys</li>
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">Vote on Green Initiatives</li>
              </ul>
            </div>
          )}

          {/* OFFICIAL DASHBOARD */}
          {user?.role === 'official' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Official Workspace</h3>
              <ul className="space-y-3">
                <li 
                  onClick={() => navigate('/dashboard/issues')}
                  className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700"
                >
                  Review reported Issues
                </li>
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">Publish new Surveys</li>
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">Evaluate Green Initiatives</li>
              </ul>
            </div>
          )}

          {/* ADMIN DASHBOARD */}
          {user?.role === 'admin' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Admin Workspace</h3>
              <ul className="space-y-3">
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">Manage Users and Roles</li>
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">Global System Configurations</li>
                <li className="p-4 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-100 font-medium text-slate-700 hover:text-purple-700">View Audit Logs</li>
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
