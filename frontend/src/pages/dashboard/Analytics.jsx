import React, { useState, useEffect } from 'react';
import api from '../../api/axios.config';
import { Loader2, Users, ClipboardList, AlertTriangle, Trees, Activity, TrendingUp, Filter } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUI();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res?.data || res);
    } catch (err) {
      showToast('Failed to load system analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <p className="text-primary-600 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  const { kpis, surveysWithVotes } = stats;

  const barChartData = {
    labels: surveysWithVotes.map(s => s.title.length > 15 ? s.title.substring(0,15) + '...' : s.title),
    datasets: [
      {
        label: 'Approval Rating (%)',
        data: surveysWithVotes.map(s => s.percentage),
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald 500
        borderRadius: 8,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  };

  const pieData = {
    labels: ['Active Users', 'Open Surveys', 'Resolved Issues'],
    datasets: [
      {
        data: [kpis.activeUsers, kpis.openSurveys, kpis.resolvedIssues],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',   // Indigo
          'rgba(245, 158, 11, 0.8)',   // Amber
          'rgba(16, 185, 129, 0.8)',   // Emerald
        ],
        borderWidth: 0,
      }
    ]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Platform Engagement',
        data: [12, 19, 25, 32, kpis.activeUsers, kpis.totalVotes],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">System Analytics</h1>
          <p className="text-textSecondary mt-2 flex items-center gap-2">
            <Activity size={16} /> Live monitoring of platform engagement and health.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors text-textSecondary">
          <Filter size={16} /> Last 30 Days
        </button>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Users className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-textSecondary text-sm font-bold uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-3xl font-black text-textPrimary">{kpis.activeUsers}</h3>
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> +12% this month</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
            <ClipboardList className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-textSecondary text-sm font-bold uppercase tracking-wider mb-1">Total Votes</p>
            <h3 className="text-3xl font-black text-textPrimary">{kpis.totalVotes}</h3>
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> High Engagement</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-textSecondary text-sm font-bold uppercase tracking-wider mb-1">Resolved Issues</p>
            <h3 className="text-3xl font-black text-textPrimary">{kpis.resolvedIssues}</h3>
            <p className="text-xs text-textMuted font-bold mt-2">Closed successfully</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <Trees className="text-rose-600" size={24} />
          </div>
          <div>
            <p className="text-textSecondary text-sm font-bold uppercase tracking-wider mb-1">Open Surveys</p>
            <h3 className="text-3xl font-black text-textPrimary">{kpis.openSurveys}</h3>
            <p className="text-xs text-textMuted font-bold mt-2">Active campaigns</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border h-96 flex flex-col">
          <h3 className="font-extrabold text-lg text-textPrimary mb-6">Top Survey Approval Ratings</h3>
          <div className="flex-1 relative">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border h-96 flex flex-col items-center">
          <h3 className="font-extrabold text-lg text-textPrimary mb-6 w-full text-left">Platform Metric Distribution</h3>
          <div className="flex-1 relative w-full flex justify-center max-h-72">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Line Chart — Full width */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border h-96 flex flex-col lg:col-span-2">
          <h3 className="font-extrabold text-lg text-textPrimary mb-6">User Engagement Trend</h3>
          <div className="flex-1 relative">
            <Line data={lineData} options={{ maintainAspectRatio: false, tension: 0.4 }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
