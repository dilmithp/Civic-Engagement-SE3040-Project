import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';

const EditInitiativeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '', description: '', location: '', date: '', status: 'Upcoming'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitiative = async () => {
            try {
                const response = await greenInitiativeService.getInitiativeById(id);
                const data = response.data || response;
                const dateObj = new Date(data.date);
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    location: data.location || '',
                    date: !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 16) : '',
                    status: data.status || 'Upcoming'
                });
            } catch (err) {
                setError('Failed to load initiative details.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitiative();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await greenInitiativeService.updateInitiative(id, formData);
            navigate('/dashboard/initiatives');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update initiative.');
            setSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

    if (loading) return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="h-5 w-36 bg-gray-200 rounded-lg animate-pulse mb-8" />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="px-8 py-7 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200" />
                        <div className="space-y-2">
                            <div className="h-5 w-48 bg-gray-200 rounded" />
                            <div className="h-3 w-64 bg-gray-100 rounded" />
                        </div>
                    </div>
                    <div className="px-8 py-8 space-y-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}>
                                <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                                <div className="h-11 bg-gray-100 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    to="/dashboard/initiatives"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-700 mb-8 transition-colors group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Initiatives
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-7 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Initiative</h2>
                                <p className="text-gray-400 text-sm mt-0.5">Update the details of your community event.</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-8">
                        {error && (
                            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClass}>Event Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} required />
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={`${inputClass} resize-none`} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Date &amp; Time</label>
                                    <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="pt-3 flex items-center gap-3">
                                <button
                                    type="submit" disabled={saving}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm tracking-wide shadow-md transition-all duration-200 ${
                                        saving
                                            ? 'bg-green-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-[0.98]'
                                    }`}
                                >
                                    {saving ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                            Saving…
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <Link
                                    to="/dashboard/initiatives"
                                    className="px-5 py-3.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditInitiativeForm;

