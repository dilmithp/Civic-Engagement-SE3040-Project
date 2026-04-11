import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, ClipboardCheck, TrendingUp, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios.config';
import { ENDPOINTS } from '../api/endpoints';

const formatNumber = (num) => num > 999 ? (num/1000).toFixed(1) + 'K' : num;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(ENDPOINTS.DASHBOARD.STATS);
        setStats(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center text-primary-500 font-medium">
      <Loader2 size={32} className="animate-spin mb-4 text-primary-600" />
      Syncing civic dashboard data...
    </div>;
  }

  // Define dynamic KPI array mapped from backend response
  const kpis = stats ? [
    { label: 'Active Users', value: formatNumber(stats.kpis.activeUsers), delta: 'System', up: true, icon: <Users size={20} /> },
    { label: 'Open Surveys', value: stats.kpis.openSurveys, delta: 'Active', up: true, icon: <ClipboardCheck size={20} /> },
    { label: 'Total Votes', value: formatNumber(stats.kpis.totalVotes), delta: 'Community', up: true, icon: <TrendingUp size={20} /> },
    { label: 'Resolved Issues', value: stats.kpis.resolvedIssues, delta: 'Verified', up: true, icon: <CheckCircle2 size={20} /> },
    { label: 'Platform Health', value: '99.9%', delta: 'Optimal', neutral: true, icon: <Activity size={20} /> },
  ] : [];

  const activities = stats?.activities || [];
  const surveysWithVotes = stats?.surveysWithVotes || [];

  return (
    <div className="min-h-screen font-sans space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. WELCOME BANNER */}
      <div className="relative overflow-hidden w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 rounded-2xl p-8 shadow-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-2xl"></div>
        <div className="absolute bottom-0 right-32 -mb-12 w-48 h-48 rounded-full bg-white opacity-5 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || user?.email?.split('@')[0] || 'Citizen'} 👋</h1>
            <p className="text-primary-100 max-w-xl leading-relaxed">
              Here's the latest pulse on your city's active development. Check recent tracking activities to stay involved.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors shadow-sm whitespace-nowrap shrink-0">
            View Notifications
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-primary-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl p-2.5 bg-primary-100 text-primary-600">
                {kpi.icon}
              </div>
              <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                kpi.up ? 'bg-green-100 text-green-700' : 
                kpi.neutral ? 'bg-primary-100 text-primary-600' : 
                'bg-red-100 text-red-600'
              }`}>
                {kpi.delta}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-primary-900 tabular-nums tracking-tight">
              {kpi.value}
            </div>
            <div className="text-sm text-primary-500 font-medium mt-1">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* 3. TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-primary-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-primary-900">Recent Activity Network</h3>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
             {activities.length > 0 ? activities.map((act, i) => (
              <div key={i} className={`flex gap-4 pb-4 ${i !== activities.length - 1 ? 'border-b border-primary-100' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  act.type === 'success' ? 'bg-green-100 text-green-600' :
                  act.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-primary-100 text-primary-600'
                }`}>
                  {act.type === 'success' ? <CheckCircle2 size={16} /> :
                   act.type === 'warning' ? <AlertCircle size={16} /> :
                   <Activity size={16} />}
                </div>
                <div>
                  <h4 className="text-sm text-primary-900 font-semibold">{act.title}</h4>
                  <p className="text-sm text-primary-700 mt-0.5">{act.desc}</p>
                  <span className="text-xs text-primary-400 mt-1.5 block">{act.time}</span>
                </div>
              </div>
             )) : (
              <div className="text-primary-400 italic py-10 text-center">No recent activities on the network.</div>
             )}
          </div>
        </div>
        
        {/* Right: Stacked Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Survey Participation */}
          <div className="bg-white border border-primary-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-primary-900 mb-4">Survey Participation</h3>
            <div className="space-y-4">
               {surveysWithVotes.length > 0 ? surveysWithVotes.map((survey, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-primary-700 max-w-[200px] truncate">{survey.title}</span>
                      <span className="text-xs font-bold text-primary-600 min-w-8 text-right">{survey.percentage}%</span>
                    </div>
                    <div className="w-full bg-primary-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all duration-1000" style={{width: `${survey.percentage}%`}}></div>
                    </div>
                  </div>
               )) : (
                 <div className="text-xs text-primary-400">No active surveys available.</div>
               )}
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white border border-primary-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-primary-900 mb-4">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-primary-100">
                <span className="text-sm font-medium text-primary-700">API Servers</span>
                <span className="badge bg-primary-100 text-primary-700 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>Operational</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-primary-100">
                <span className="text-sm font-medium text-primary-700">Database Engine</span>
                <span className="badge bg-primary-100 text-primary-700 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary-700">Storage Cluster</span>
                <span className="badge bg-primary-100 text-primary-700 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>Operational</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
