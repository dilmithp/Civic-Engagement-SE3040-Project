import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle, Loader, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { issueService } from '../../services/issueService';
import IssueCard from './IssueCard';

const CATEGORIES = ['All Categories', 'Pothole', 'Broken Streetlight', 'Illegal Dumping', 'Water Leak', 'Damaged Sidewalk', 'Graffiti', 'Traffic Signal', 'Other'];
const STATUSES = ['All Statuses', 'Pending', 'In Progress', 'Resolved', 'Withdrawn'];

const IssueList = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [tab, setTab] = useState('all'); // 'all' or 'my'
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // Refetch when tab or filters change
  useEffect(() => {
    fetchIssues();
  }, [tab, filterCategory, filterStatus]);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterCategory !== 'All Categories') params.category = filterCategory;
      if (filterStatus !== 'All Statuses') params.status = filterStatus;

      let data = [];
      if (tab === 'my') {
        const response = await issueService.getMyIssues(params);
        data = response.data.docs ? response.data.docs : response.data;
      } else {
        const response = await issueService.getPublicIssues(params);
        data = response.data.docs ? response.data.docs : response.data;
      }
      
      // Ensure data is array
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      setError(err.response?.data?.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-textMain tracking-tight">Community Issues</h1>
          <p className="text-textMuted mt-1">Discover, track, and manage civic issues.</p>
        </div>
        {user?.role === 'citizen' && (
          <Link 
            to="/dashboard/issues/create" 
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Submit a New Issue
          </Link>
        )}
      </div>

      {/* Primary Toolbar: Tabs + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-4 rounded-xl shadow-sm border border-border">
        {/* Tabs */}
        <div className="flex gap-2 bg-background p-1.5 rounded-lg border border-border w-full md:w-auto">
          <button 
            onClick={() => setTab('all')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-md font-medium text-sm transition-colors ${tab === 'all' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' : 'text-textMuted hover:text-textMain'}`}
          >
            All Issues
          </button>
          {user?.role === 'citizen' && (
            <button 
              onClick={() => setTab('my')}
              className={`flex-1 md:flex-none px-5 py-2 rounded-md font-medium text-sm transition-colors ${tab === 'my' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            >
              My Issues
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-1 md:flex-none w-full md:w-auto gap-3 items-center">
          <Filter size={18} className="text-textMuted" />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-48 bg-background border border-border rounded-lg px-3 py-2 text-sm text-textMain focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-40 bg-background border border-border rounded-lg px-3 py-2 text-sm text-textMain focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* States & Data */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-textMuted">
          <Loader className="animate-spin text-primary-500 mb-4" size={32} />
          <p>Syncing issues...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl p-8 flex flex-col items-center text-center">
          <AlertCircle size={36} className="mb-3" />
          <h3 className="font-semibold text-lg mb-1">Failed to load issues</h3>
          <p className="text-sm opacity-90">{error}</p>
          <button 
            onClick={fetchIssues}
            className="mt-6 px-5 py-2.5 bg-white dark:bg-black border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-xl p-16 text-center flex flex-col items-center text-textMuted">
          <AlertCircle size={48} className="mb-5 text-primary-300 dark:text-primary-700" />
          <h3 className="text-xl font-medium text-textMain mb-2">No matching issues</h3>
          <p className="text-sm max-w-sm mb-6 opacity-80">
            {tab === 'my' ? "You haven't reported any issues matching these filters." : "There are currently no community issues matching your filters."}
          </p>
          {(filterCategory !== 'All Categories' || filterStatus !== 'All Statuses') && (
            <button 
              onClick={() => { setFilterCategory('All Categories'); setFilterStatus('All Statuses'); }}
              className="text-primary-600 font-medium hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map(issue => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueList;
