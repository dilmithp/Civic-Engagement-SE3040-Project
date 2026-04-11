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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Link to="/dashboard/initiatives" className="text-textMuted hover:text-textMain transition-colors">← Back</Link>
                <div>
                    <h1 className="text-2xl font-bold text-textMain">Host a Green Initiative</h1>
                    <p className="text-textMuted text-sm mt-0.5">Fill out the details to organise a new community event.</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title flex items-center gap-2">🌿 New Initiative</span>
                </div>
                <div className="p-6">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label>Event Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Riverside Plastic Recovery" required />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe what volunteers will be doing..." rows="4" required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. City Park" required />
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="btn btn-default btn-primary w-full justify-center">
                                {loading ? 'Creating…' : '🌿 Publish Initiative'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateInitiativeForm;