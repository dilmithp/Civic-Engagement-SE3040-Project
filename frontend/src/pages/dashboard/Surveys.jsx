import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Trash2, X, Check, FileText, CheckCircle2, Clock, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios.config';
import { ENDPOINTS } from '../../api/endpoints';

const Surveys = () => {
  const { user } = useAuth();
  
  // State
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeVoteSurvey, setActiveVoteSurvey] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Urban Planning',
    deadline: '',
    targetAudience: 'all',
    options: [{ text: '' }, { text: '' }]
  });

  const canManage = user?.role === 'admin' || user?.role === 'official';

  // Dummy toast
  const showToast = (msg, type = 'success') => {
    // Basic native visual feedback for the user
    console.log(`[${type.toUpperCase()}] ${msg}`);
    if(type === 'error') alert(msg);
  };

  // --- API Calls ---
  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.SURVEYS.GET_ACTIVE);
      setSurveys(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load surveys', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(ENDPOINTS.SURVEYS.BASE, formData);
      setIsCreateModalOpen(false);
      showToast('Survey published successfully');
      fetchSurveys();
      // Reset form
      setFormData({
        title: '', description: '', category: 'Urban Planning', deadline: '', targetAudience: 'all', options: [{ text: '' }, { text: '' }]
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create survey', 'error');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to close/delete this survey?')) return;
    try {
      await api.delete(`${ENDPOINTS.SURVEYS.BASE}/${id}`);
      showToast('Survey deleted successfully');
      fetchSurveys();
    } catch (err) {
      showToast('Failed to delete survey', 'error');
    }
  };

  const handleVote = async (e, surveyId, optionIndex) => {
    e.preventDefault();
    try {
      await api.patch(`${ENDPOINTS.SURVEYS.BASE}/${surveyId}/vote`, { selectedOptionIndex: optionIndex });
      showToast('Vote cast successfully!');
      setActiveVoteSurvey(null);
      fetchSurveys();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cast vote', 'error');
    }
  };

  // --- Form Handlers ---
  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, { text: '' }] });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // --- Derived Data ---
  const filteredData = surveys.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalVotesAcrossAll = surveys.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0);
  const closingSoonCount = surveys.filter(s => calculateDaysLeft(s.deadline) <= 3).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Participatory Planning & Surveys</h1>
          <p className="text-textMuted mt-1">Manage active civic polls and view citizen voting metrics.</p>
        </div>
        {canManage && (
          <button 
            className="btn btn-primary btn-default gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} /> New Survey
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="flex justify-between items-start">
            <div className="kpi-icon"><ClipboardList size={20} /></div>
          </div>
          <div className="kpi-value">{surveys.length}</div>
          <div className="text-sm text-textMuted font-medium">Total Surveys</div>
        </div>
        <div className="kpi-card">
          <div className="flex justify-between items-start">
            <div className="kpi-icon"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-value">{surveys.filter(s => s.status === 'active').length}</div>
          <div className="text-sm text-textMuted font-medium">Active Polling</div>
        </div>
        <div className="kpi-card">
          <div className="flex justify-between items-start">
            <div className="kpi-icon"><FileText size={20} /></div>
          </div>
          <div className="kpi-value">{totalVotesAcrossAll.toLocaleString()}</div>
          <div className="text-sm text-textMuted font-medium">Total Votes Cast</div>
        </div>
        <div className="kpi-card">
          <div className="flex justify-between items-start">
            <div className="kpi-icon"><Clock size={20} /></div>
          </div>
          <div className="kpi-value">{closingSoonCount}</div>
          <div className="text-sm text-textMuted font-medium">Closing Soon</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Surveys</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted pointer-events-none">
              <Search size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Search polls..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-textMuted">Loading surveys from network...</div>
        ) : filteredData.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Survey Title & Topic</th>
                  <th>Status</th>
                  <th>Audience</th>
                  <th>Votes Cast</th>
                  <th>Time Left</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const daysLeft = calculateDaysLeft(item.deadline);
                  return (
                  <tr key={item._id}>
                    <td>
                      <div className="font-medium text-textMain">{item.title}</div>
                      <div className="text-xs text-textMuted mt-0.5" title={item.description}>ID: {item._id.substring(0, 8)}...</div>
                    </td>
                    <td>
                      {item.status === 'active' && <div className="badge badge-green"><span className="status-dot dot-active"></span>Active</div>}
                      {item.status === 'closed' && <div className="badge badge-neutral"><span className="status-dot dot-closed"></span>Closed</div>}
                      {item.status === 'expired' && <div className="badge badge-red"><span className="status-dot dot-closed"></span>Expired</div>}
                    </td>
                    <td className="text-textMuted capitalize">{item.targetAudience}</td>
                    <td className="font-medium">{item.totalVotes?.toLocaleString() || 0}</td>
                    <td className="text-textMuted">
                      {daysLeft > 0 ? `${daysLeft} days` : 'Ended'}
                    </td>
                    <td className="text-right space-x-2 whitespace-nowrap">
                       {item.status === 'active' ? (
                         <button 
                           onClick={() => setActiveVoteSurvey(item)}
                           className="btn btn-sm btn-primary"
                         >
                           Vote Map
                         </button>
                       ) : (
                         <button 
                           onClick={() => setActiveVoteSurvey(item)}
                           className="btn btn-icon btn-ghost text-primary-600 hover:text-primary-800 transition-colors"
                           title="View Results"
                         >
                           <Eye size={16} />
                         </button>
                       )}
                       {canManage && (
                         <button 
                           onClick={() => handleDelete(item._id)}
                           className="btn btn-icon btn-ghost text-slate-500 hover:text-red-600 transition-colors ml-2"
                           title="Delete Survey"
                         >
                           <Trash2 size={16} />
                         </button>
                       )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-textMuted mb-3">
              <Search size={24} />
            </div>
            <h3 className="text-base font-semibold text-textMain">No surveys found</h3>
            <p className="text-sm text-textMuted mt-1 max-w-sm">We couldn't find any participatory planning surveys matching your criteria.</p>
          </div>
        )}
      </div>

      {/* --- Create Modal --- */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="card-title">Create New Survey</h3>
              <button className="text-textMuted hover:text-textMain transition-colors p-1" onClick={() => setIsCreateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label>Survey Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})}>
                      <option value="all">Everyone</option>
                      <option value="citizen">Citizens Only</option>
                      <option value="official">Officials Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Closing Date</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description & Context</label>
                  <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                </div>

                <div className="form-group">
                  <label className="flex justify-between items-center px-1">
                    Voting Options
                    <button type="button" onClick={addOption} className="text-primary-600 hover:text-primary-800 text-xs flex items-center gap-1 font-bold">
                      <Plus size={12} /> Add
                    </button>
                  </label>
                  <div className="space-y-2 mt-1">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input type="text" value={opt.text} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i+1}`} className="flex-1" required />
                        {formData.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(i)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg shrink-0">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-default" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-default">Publish Survey</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Vote/View Modal --- */}
      {activeVoteSurvey && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header items-start border-none pb-0">
              <div>
                <h3 className="card-title text-xl mb-1">{activeVoteSurvey.title}</h3>
                <span className={`badge ${activeVoteSurvey.status === 'active' ? 'badge-green' : 'badge-neutral'}`}>
                  {activeVoteSurvey.status}
                </span>
              </div>
              <button className="text-textMuted hover:text-textMain p-1" onClick={() => setActiveVoteSurvey(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body space-y-6 pt-4">
              <p className="text-textMuted text-sm bg-surfaceHover p-4 rounded-lg my-2 border border-border">
                {activeVoteSurvey.description}
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold text-textMain text-sm uppercase tracking-wider">Available Options</h4>
                {activeVoteSurvey.options?.map((opt, i) => {
                  // Calculate dynamic percentage
                  const rawPercent = activeVoteSurvey.totalVotes > 0 ? (opt.voteCount / activeVoteSurvey.totalVotes) * 100 : 0;
                  const percent = Math.round(rawPercent);
                  const isClosed = activeVoteSurvey.status !== 'active';

                  return (
                    <div key={i} className="relative bg-background border border-border rounded-xl p-4 overflow-hidden group">
                      {/* Percent fill bar for visuals */}
                      <div className="absolute inset-y-0 left-0 bg-primary-100 dark:bg-primary-900/20 z-0 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                      
                      <div className="relative z-10 flex justify-between items-center">
                        <span className="font-medium text-textMain">{opt.text}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-textMuted font-medium text-sm w-12 text-right">{percent}%</span>
                          {!isClosed && (
                            <button 
                              onClick={(e) => handleVote(e, activeVoteSurvey._id, i)}
                              className="btn btn-sm btn-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity whitespace-nowrap"
                            >
                              Vote
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-sm text-textMuted pt-4 border-t border-border">
                <span>Total Votes: <strong>{activeVoteSurvey.totalVotes || 0}</strong></span>
                <span>Closes: {new Date(activeVoteSurvey.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Surveys;
