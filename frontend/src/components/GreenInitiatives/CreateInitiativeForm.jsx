import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';

const CreateInitiativeForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '', description: '', location: '', date: '', status: 'Upcoming'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await greenInitiativeService.createInitiative(formData);
            navigate('/dashboard/initiatives');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create initiative. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back link */}
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
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <span className="text-xl">🌿</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Host a Green Initiative</h2>
                                <p className="text-gray-400 text-sm mt-0.5">Fill out the details to organise a new community event.</p>
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
                                <input
                                    type="text" name="title" value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Riverside Plastic Recovery"
                                    className={inputClass} required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    name="description" value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what volunteers will be doing..."
                                    rows="4"
                                    className={`${inputClass} resize-none`}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input
                                        type="text" name="location" value={formData.location}
                                        onChange={handleChange} placeholder="e.g. City Park"
                                        className={inputClass} required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Date &amp; Time</label>
                                    <input
                                        type="datetime-local" name="date" value={formData.date}
                                        onChange={handleChange}
                                        className={inputClass} required
                                    />
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="submit" disabled={loading}
                                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm tracking-wide shadow-md transition-all duration-200 ${
                                        loading
                                            ? 'bg-green-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-[0.98]'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                            Creating…
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                            Publish Initiative
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInitiativeForm;