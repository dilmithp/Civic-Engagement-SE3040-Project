import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { issueService } from '../../services/issueService';
import { MapPin, Clock, ArrowLeft, Loader, MessageSquare, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Withdrawn'];

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Withdrawn': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssueById(id);
      setIssue(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setStatusUpdating(true);
      await issueService.updateStatus(id, { status: newStatus });
      setIssue(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setSubmittingComment(true);
      const res = await issueService.addComment(id, { text: commentText });
      // Depending on backend, might return the new comment or the whole issue.
      // We will re-fetch to be safe.
      setCommentText('');
      await fetchIssue();
    } catch (err) {
      console.error(err);
      alert('Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this issue?')) return;
    try {
      setActionLoading(true);
      await issueService.withdrawIssue(id);
      await fetchIssue();
    } catch (err) {
      console.error(err);
      alert('Failed to withdraw issue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this issue?')) return;
    try {
      setActionLoading(true);
      await issueService.deleteIssue(id);
      navigate('/dashboard/issues');
    } catch (err) {
      console.error(err);
      alert('Failed to delete issue.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-textMuted">
        <Loader className="animate-spin text-primary-500 mb-4" size={32} />
        <p>Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center text-center mt-10">
        <AlertCircle size={32} className="mb-3" />
        <h3 className="font-semibold text-lg">Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard/issues')} className="mt-4 underline">Back to Issues</button>
      </div>
    );
  }

  const isAdminOrOfficial = user?.role === 'admin' || user?.role === 'official';
  
  const currentUserId = user?.id || user?._id;
  const issueReporterId = issue?.reporter?._id || issue?.reporter || issue?.reportedBy;
  const isOwner = currentUserId && issueReporterId && String(currentUserId) === String(issueReporterId);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <Link 
        to="/dashboard/issues" 
        className="inline-flex items-center text-sm font-medium text-textMuted hover:text-textMain transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Issues
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-textMain leading-tight">{issue.title}</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold capitalize whitespace-nowrap ${statusColors[issue.status]}`}>
                {issue.status}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted mb-6 border-b border-border pb-6">
              <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md font-medium border border-primary-100">
                {issue.category}
              </span>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{issue.location?.address || 'Location provided'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-textMain mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </div>

            {issue.images && issue.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-textMain">Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issue.images.map((img, i) => (
                    <img key={i} src={img.url} alt="Issue evidence" className="w-full h-32 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
              <MessageSquare size={20} />
              Comments & Updates
            </h3>

            {issue.comments?.length > 0 ? (
              <div className="space-y-4 mb-8">
                {issue.comments.map((c, i) => (
                  <div key={i} className="bg-background border border-border p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-textMain">{c.authorName || 'Official'}</span>
                      <span className="text-xs text-textMuted">{new Date(c.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-textMain">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted text-sm mb-8 text-center italic">No comments yet.</p>
            )}

            {isAdminOrOfficial && (
              <form onSubmit={handleAddComment}>
                <label className="block text-sm font-medium text-textMain mb-2">Add Official Update</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg mb-3 resize-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Type your update here..."
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Post Update'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Status Update Card (Admins/Officials) */}
          {(user.role === 'admin' || user.role === 'official') && (
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-primary-500" />
                Update Issue Status
              </h3>
              
              <select
                value={issue.status}
                onChange={handleStatusChange}
                disabled={statusUpdating || issue.status === 'Resolved' || issue.status === 'Withdrawn'}
                className="w-full p-3 bg-background border border-border rounded-lg text-textMain capitalize focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {/* Dynamically list ONLY allowed transitions + the current status */}
                <option value={issue.status}>{issue.status}</option>
                {issue.status === 'Pending' && <option value="In Progress">In Progress</option>}
                {issue.status === 'In Progress' && (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </>
                )}
              </select>
              {statusUpdating && <p className="text-xs text-primary-500 mt-2">Updating...</p>}
            </div>
          )}

          {/* Owner & Admin Actions */}
          {(isOwner || user?.role === 'admin') && (
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-primary-500" /> 
                Manage Report
              </h3>
              <div className="space-y-3">
                {isOwner && issue.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/issues/edit/${issue._id}`)}
                      disabled={actionLoading}
                      className="w-1/2 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium transition-colors border border-primary-200"
                    >
                      Edit Report
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={actionLoading}
                      className="w-1/2 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg font-medium transition-colors border border-yellow-200"
                    >
                      Withdraw
                    </button>
                  </div>
                )}
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="w-full py-2.5 flex items-center justify-center gap-2 border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  {isOwner ? 'Delete My Issue' : 'Delete Issue (Admin)'}
                </button>
              </div>
            </div>
          )}
          
          {/* Info Card */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-textMain mb-4">Reporter Information</h3>
            <p className="text-sm text-textMuted mb-2">Reported by: <span className="font-medium text-textMain">{issue.reportedBy?.name || 'A Citizen'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
