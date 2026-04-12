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

    if (loading) return (
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-surface rounded" />
            <div className="card p-6 space-y-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-border rounded" />)}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Link to="/dashboard/initiatives" className="text-textMuted hover:text-textMain transition-colors">← Back</Link>
                <div>
                    <h1 className="text-2xl font-bold text-textMain">Edit Initiative</h1>
                    <p className="text-textMuted text-sm mt-0.5">Update the details of your community event.</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">✏️ Edit Details</span>
                </div>
                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label>Event Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button type="submit" disabled={saving} className="btn btn-default btn-primary flex-1 justify-center">
                                {saving ? 'Saving…' : '✓ Save Changes'}
                            </button>
                            <Link to="/dashboard/initiatives" className="btn btn-default btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditInitiativeForm;