import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle, Loader, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Tabs & Filters State
  const [tab, setTab] = useState('all'); // 'all' or 'my'
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  
  // Search Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 whenever filters or search strictly change
  useEffect(() => {
    setPage(1);
  }, [tab, filterCategory, filterStatus, debouncedSearch]);

  // Refetch when parameters mutate
  useEffect(() => {
    fetchIssues();
  }, [tab, filterCategory, filterStatus, debouncedSearch, page]);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build smart query params
      const params = {
        page,
        limit: 9, // Exactly 3 rows of 3 columns
      };
      
      if (filterCategory !== 'All Categories') params.category = filterCategory;
      if (filterStatus !== 'All Statuses') params.status = filterStatus;
      if (debouncedSearch.trim() !== '') params.search = debouncedSearch.trim();

      let response;
      if (tab === 'my') {
        response = await issueService.getMyIssues(params);
      } else {
        response = await issueService.getPublicIssues(params);
      }
      
      const payload = response.data;
      
      // Determine if backend returned a mongoose-paginate-v2 object
      if (payload.docs) {
        setIssues(payload.docs);
        setTotalPages(payload.totalPages || 1);
      } else {
        // Fallback for flat arrays
        setIssues(Array.isArray(payload) ? payload : []);
        setTotalPages(1);
      }
      
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
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Report Issue
          </Link>
        )}
      </div>

      {/* Primary Toolbar: Tabs + Filters + Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-surface p-4 rounded-xl shadow-sm border border-border">
        {/* Tabs */}
        <div className="flex gap-2 bg-background p-1.5 rounded-lg border border-border w-full lg:w-auto">
          <button 
            onClick={() => setTab('all')}
            className={`flex-1 lg:flex-none px-5 py-2 rounded-md font-medium text-sm transition-colors ${tab === 'all' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' : 'text-textMuted hover:text-textMain'}`}
          >
            All Issues
          </button>
          {user?.role === 'citizen' && (
            <button 
              onClick={() => setTab('my')}
              className={`flex-1 lg:flex-none px-5 py-2 rounded-md font-medium text-sm transition-colors ${tab === 'my' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            >
              My Issues
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row w-full lg:w-auto gap-3 items-center">
          {/* Keyword Search */}
          <div className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-textMuted" />
            </div>
            <input
              type="text"
              placeholder="Search titles & descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-textMain placeholder-textMuted focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="flex w-full md:w-auto gap-3 items-center">
            <Filter size={18} className="text-textMuted hidden md:block" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 md:flex-none w-full md:w-40 bg-background border border-border rounded-lg px-3 py-2 text-sm text-textMain focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 md:flex-none w-full md:w-36 bg-background border border-border rounded-lg px-3 py-2 text-sm text-textMain focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* States & Data Loading */}
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
          <p className="text-sm max-w-md mb-6 opacity-80">
            {tab === 'my' 
              ? "You haven't reported any issues matching these filters." 
              : "There are currently no community issues matching your filters."}
          </p>
          {(filterCategory !== 'All Categories' || filterStatus !== 'All Statuses' || debouncedSearch) && (
            <button 
              onClick={() => { 
                setFilterCategory('All Categories'); 
                setFilterStatus('All Statuses');
                setSearchQuery('');
              }}
              className="text-primary-600 font-medium hover:underline text-sm"
            >
              Clear all filters and search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-6 border-t border-border mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-surface text-textMain border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <span className="text-sm font-semibold text-textMain bg-surface border border-border px-4 py-2 rounded-lg">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-surface text-textMain border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueList;
