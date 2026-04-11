import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Eye, FileText, Filter, CheckCircle2, Clock, Edit } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios.config';
import { ENDPOINTS } from '../../api/endpoints';

const Surveys = () => {
  const { user } = useAuth();
  
  // State
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' or 'Results'
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeVoteSurvey, setActiveVoteSurvey] = useState(null);
  const [activeEditSurveyId, setActiveEditSurveyId] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Urban Planning',
    deadline: '',
    targetAudience: 'all',
    isImportant: false,
    options: [{ text: '' }, { text: '' }]
  });

  const canManage = user?.role === 'admin' || user?.role === 'official';

  // --- API Calls ---
  const showToast = (msg, type = 'success') => {
    console.log(`[${type}] ${msg}`);
    if(type === 'error') alert(msg);
  };

  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.SURVEYS.GET_ACTIVE);
      const data = res.data?.data || res.data || [];
      setSurveys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load surveys', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', category: 'Urban Planning', deadline: '', targetAudience: 'all', isImportant: false, options: [{ text: '' }, { text: '' }]
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(ENDPOINTS.SURVEYS.BASE, formData);
      setIsCreateModalOpen(false);
      showToast('Survey published successfully');
      fetchSurveys();
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create survey', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`${ENDPOINTS.SURVEYS.BASE}/${activeEditSurveyId}`, formData);
      setIsEditModalOpen(false);
      setActiveEditSurveyId(null);
      showToast('Survey updated successfully');
      fetchSurveys();
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update survey', 'error');
    }
  };

  const openEditModal = (survey) => {
    setFormData({
      title: survey.title,
      description: survey.description,
      category: survey.category || 'Urban Planning',
      deadline: survey.deadline ? new Date(survey.deadline).toISOString().split('T')[0] : '',
      targetAudience: survey.targetAudience || 'all',
      isImportant: survey.isImportant || false,
      options: survey.options && survey.options.length > 0 ? survey.options : [{ text: '' }, { text: '' }]
    });
    setActiveEditSurveyId(survey._id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this survey?')) return;
    try {
      await api.delete(`${ENDPOINTS.SURVEYS.BASE}/${id}`);
      showToast('Survey deleted');
      fetchSurveys();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleVote = async (surveyId, optionIndex) => {
    try {
      await api.patch(`${ENDPOINTS.SURVEYS.BASE}/${surveyId}/vote`, { selectedOptionIndex: optionIndex });
      showToast('Vote cast successfully!');
      setActiveVoteSurvey(null);
      setSelectedIdx(null);
      fetchSurveys();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cast vote', 'error');
    }
  };

  // Form Utils
  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };
  const addOption = () => setFormData({ ...formData, options: [...formData.options, { text: '' }] });
  const removeOption = (index) => setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) });

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Data processing
  const filteredData = surveys.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const calculateDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const activeCount = surveys.filter(s => s.status === 'active').length;
  const draftCount = 0; // Conceptual placeholder
  const closedCount = surveys.filter(s => s.status !== 'active').length;

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 tracking-tight">Participatory Surveys</h1>
          <p className="text-primary-500 mt-1 text-sm">Have your say in ongoing civic planning and issues.</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="btn btn-primary gap-2">
            <Plus size={16} /> New Survey
          </button>
        )}
      </div>

      {/* STATS ROW (Pills) */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="bg-white border border-primary-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary-500"></span>
          <span className="text-sm font-medium text-primary-600">Active</span>
          <span className="text-primary-900 font-bold ml-1">{activeCount}</span>
        </div>
        <div className="bg-white border border-primary-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-sm font-medium text-primary-600">Drafts</span>
          <span className="text-primary-900 font-bold ml-1">{draftCount}</span>
        </div>
        <div className="bg-white border border-primary-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary-300"></span>
          <span className="text-sm font-medium text-primary-600">Closed</span>
          <span className="text-primary-900 font-bold ml-1">{closedCount}</span>
        </div>
      </div>

      {/* TABS & FILTER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex border-b border-primary-200 w-full md:w-auto">
          <button 
            className={`px-5 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'All' ? 'text-primary-600 border-primary-600' : 'text-primary-400 border-transparent hover:text-primary-600'}`}
            onClick={() => setActiveTab('All')}
          >
            All Surveys
          </button>
          <button 
            className={`px-5 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'Results' ? 'text-primary-600 border-primary-600' : 'text-primary-400 border-transparent hover:text-primary-600'}`}
            onClick={() => setActiveTab('Results')}
          >
            Results
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
            <input 
              type="text" 
              placeholder="Search surveys..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-primary-50 border border-primary-200 focus:ring-2 focus:ring-primary-500 rounded-lg pl-9 pr-3 py-2 text-sm text-primary-900 placeholder:text-primary-400 outline-none transition-all"
            />
          </div>
          <button className="p-2 border border-primary-200 bg-primary-50 text-primary-500 rounded-lg shrink-0 hover:bg-primary-100 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* SURVEY CARDS GRID */}
      {isLoading ? (
        <div className="p-12 text-center text-primary-400 animate-pulse font-medium">Fetching surveys...</div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.filter(s => activeTab === 'All' || s.status !== 'active').map((survey) => {
            const daysLeft = calculateDaysLeft(survey.deadline);
            const isVoted = false; // Add real user specific check if backend supports it
            const topOption = [...(survey.options || [])].sort((a,b) => b.voteCount - a.voteCount)[0];

            return (
              <div 
                key={survey._id} 
                className={`flex flex-col bg-white border ${isVoted ? 'border-l-4 border-l-primary-400 border-primary-300 bg-primary-50' : 'border-primary-200'} rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group`}
              >
                {/* Header/Badges */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    {survey.status === 'active' 
                      ? <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>Active</span>
                      : <span className="bg-primary-50 text-primary-500 text-xs font-semibold px-2 py-0.5 rounded-full">Closed</span>
                    }
                    {survey.isImportant && <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Important</span>}
                  </div>
                  {canManage && (
                    <div className="flex gap-2 hidden group-hover:flex absolute right-4 top-4">
                      <button onClick={() => openEditModal(survey)} className="text-primary-200 hover:text-primary-600 transition-colors bg-white rounded-full">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(survey._id)} className="text-primary-200 hover:text-red-500 transition-colors bg-white rounded-full">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="mb-4 flex-1">
                  <h3 className="text-base font-bold text-primary-900 leading-tight mb-1">{survey.title}</h3>
                  <p className="text-sm text-primary-600 line-clamp-2">{survey.description}</p>
                </div>

                {/* Optional Top Result Preview */}
                {survey.options?.length > 0 && activeTab === 'Results' && topOption && (
                  <div className="mb-4 bg-primary-50 p-3 rounded-xl border border-primary-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-primary-800">Leading: {topOption.text}</span>
                      <span className="text-xs text-primary-500 font-bold">{Math.round((topOption.voteCount / survey.totalVotes) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-primary-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-primary-700 to-primary-500 h-2" style={{width: `${(topOption.voteCount / survey.totalVotes) * 100 || 0}%`}}></div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-primary-100">
                  <div className="flex items-center gap-3 text-xs text-primary-500 font-medium tracking-wide">
                    <div className="flex items-center gap-1" title="Votes">
                      <FileText size={14} className="text-primary-400" /> {survey.totalVotes || 0}
                    </div>
                    <div className={`flex items-center gap-1 ${daysLeft <= 3 && survey.status === 'active' ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : ''}`} title="Deadline">
                      <Clock size={14} className={daysLeft <= 3 && survey.status === 'active' ? 'text-red-500' : 'text-primary-400'} /> 
                      {survey.status === 'active' ? (daysLeft > 0 ? `${daysLeft}d left` : 'Ends today') : 'Ended'}
                    </div>
                  </div>
                  
                  {isVoted ? (
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <CheckCircle2 size={14} /> Voted
                    </span>
                  ) : (
                    <button 
                      onClick={() => setActiveVoteSurvey(survey)}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${survey.status === 'active' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                    >
                      {survey.status === 'active' ? 'Vote Now' : 'View Stats'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50">
            <div className="w-14 h-14 bg-primary-100 text-primary-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative">
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-50"></span>
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-primary-900">No surveys found</h3>
            <p className="text-sm text-primary-500 mt-1 max-w-sm">There are no participatory surveys matching your current configuration.</p>
          </div>
      )}

      {/* --- CREATE / EDIT SURVEY MODAL --- */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-primary-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-primary-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-primary-100 flex justify-between items-center bg-primary-50/50">
              <h3 className="font-bold text-lg text-primary-900">{isEditModalOpen ? 'Edit Survey' : 'Publish New Survey'}</h3>
              <button className="text-primary-400 hover:text-primary-800 transition-colors p-1 bg-white rounded-full hover:shadow-sm" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setActiveEditSurveyId(null); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-800 mb-1.5">Survey Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border border-primary-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-primary-900 placeholder:text-primary-300 outline-none transition-all shadow-sm" placeholder="e.g. Main Street Renovation" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-800 mb-1.5">Audience</label>
                    <select value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full bg-white border border-primary-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-primary-900 outline-none shadow-sm">
                      <option value="all">Everyone</option>
                      <option value="citizen">Citizens Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-800 mb-1.5">Closing Date</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-white border border-primary-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-primary-900 outline-none shadow-sm" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-800 mb-1.5">Description</label>
                  <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-primary-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-primary-900 placeholder:text-primary-300 outline-none shadow-sm resize-none" placeholder="Context explaining what citizens are voting on..." required></textarea>
                </div>
                
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-primary-800 block">Mark as Important</span>
                    <span className="text-xs text-primary-400">Highlights this survey on the dashboard.</span>
                  </div>
                  <input type="checkbox" checked={formData.isImportant} onChange={e => setFormData({...formData, isImportant: e.target.checked})} className="w-5 h-5 accent-primary-600 rounded cursor-pointer" />
                </div>

                <div>
                  <label className="flex justify-between items-center text-sm font-semibold text-primary-800 mb-2">
                    Voting Options
                    <button type="button" onClick={addOption} className="text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-md text-xs flex items-center gap-1 transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 relative group">
                        <input type="text" value={opt.text} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i+1}`} className="flex-1 bg-white border border-primary-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-xl px-4 py-2 text-sm text-primary-900 outline-none shadow-sm" required />
                        {formData.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(i)} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-200 hover:text-red-500 bg-white px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-primary-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" className="px-5 py-2.5 text-sm font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setActiveEditSurveyId(null); }}>Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-600/20 rounded-xl transition-colors">{isEditModalOpen ? 'Save Changes' : 'Publish Survey'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VOTE MODAL --- */}
      {activeVoteSurvey && (() => {
        const isClosed = activeVoteSurvey.status !== 'active';

        return (
          <div className="fixed inset-0 z-50 bg-primary-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white border border-primary-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-primary-100 flex justify-between items-start bg-primary-50">
                <div>
                  <h3 className="font-bold text-lg text-primary-900 pr-4 leading-tight">{activeVoteSurvey.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">{activeVoteSurvey.category}</span>
                    <span className="text-xs font-medium text-primary-500">Closes {new Date(activeVoteSurvey.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="text-primary-400 hover:text-primary-800 transition-colors p-1.5 bg-white rounded-full shadow-sm hover:shadow" onClick={() => { setActiveVoteSurvey(null); setSelectedIdx(null); }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-primary-700 mb-5 leading-relaxed">{activeVoteSurvey.description}</p>
                
                <div className="space-y-3">
                  {activeVoteSurvey.options?.map((opt, i) => {
                    const pct = activeVoteSurvey.totalVotes > 0 ? Math.round((opt.voteCount / activeVoteSurvey.totalVotes) * 100) : 0;
                    const isSelected = selectedIdx === i;

                    if (isClosed) {
                      return (
                        <div key={i} className="relative bg-white border border-primary-200 rounded-xl p-4 overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-primary-100 transition-all duration-1000 z-0" style={{ width: `${pct}%` }}></div>
                          <div className="relative z-10 flex justify-between items-center">
                            <span className="font-medium text-primary-900 text-sm">{opt.text}</span>
                            <span className="text-primary-600 font-bold text-sm tracking-tight">{pct}%</span>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedIdx(i)}
                        className={`w-full text-left flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-primary-100 bg-white hover:border-primary-300 hover:bg-primary-50'}`}
                      >
                        <span className={`text-sm ${isSelected ? 'text-primary-900 font-bold' : 'text-primary-800 font-medium'}`}>{opt.text}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-primary-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {!isClosed && (
                  <div className="mt-6 flex flex-col gap-3">
                    <button 
                      onClick={() => handleVote(activeVoteSurvey._id, selectedIdx)}
                      disabled={selectedIdx === null}
                      className="w-full py-3 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-600/20"
                    >
                      Sumit Vote
                    </button>
                    <p className="text-xs text-primary-400 italic text-center">Your vote is anonymous and final. Cannot be changed after submission.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  );
};

export default Surveys;
