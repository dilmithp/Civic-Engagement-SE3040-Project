import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';
import { useAuth } from '../../hooks/useAuth';

const GreenInitiativeList = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuth();

    useEffect(() => { fetchInitiatives(); }, []);

    const fetchInitiatives = async () => {
        try {
            setLoading(true);
            const response = await greenInitiativeService.getAllInitiatives();
            const data = response.data || response;
            setInitiatives(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load initiatives. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await greenInitiativeService.deleteInitiative(deleteTarget.id);
            setInitiatives(initiatives.filter(init => init._id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete initiative.");
        } finally {
            setDeleting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Upcoming':  return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
            case 'Ongoing':   return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
            case 'Completed': return 'bg-primary-50 text-textMuted dark:bg-primary-900/20';
            default:          return 'bg-primary-50 text-textMuted';
        }
    };

    const getAccentBar = (status) => {
        switch (status) {
            case 'Upcoming':  return 'bg-sky-400';
            case 'Ongoing':   return 'bg-primary-500';
            case 'Completed': return 'bg-primary-300';
            default:          return 'bg-primary-300';
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
                <div className="h-9 w-72 bg-surface rounded-lg animate-pulse" />
                <div className="h-10 w-40 bg-surface rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden animate-pulse">
                        <div className="h-1.5 bg-border" />
                        <div className="p-6 space-y-3">
                            <div className="h-5 bg-border rounded w-3/4" />
                            <div className="h-4 bg-border rounded w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex flex-col items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 px-8 py-6 rounded-2xl">
                <p className="font-semibold">{error}</p>
                <button onClick={fetchInitiatives} className="text-sm font-medium underline">Try again</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Delete Modal */}
            {deleteTarget && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="text-lg font-extrabold text-textMain">Delete Initiative</h3>
                        </div>
                        <div className="modal-body text-center">
                            <p className="text-sm text-textMuted mb-1">You're about to permanently delete</p>
                            <p className="text-sm font-semibold text-textMain mb-4">"{deleteTarget.title}"</p>
                            <p className="text-xs text-textMuted">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn btn-default btn-secondary">Cancel</button>
                            <button onClick={handleDelete} disabled={deleting} className="btn btn-default btn-danger">
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🌿</span>
                        <h1 className="text-3xl font-bold text-textMain tracking-tight">Green Initiatives</h1>
                    </div>
                    <p className="text-textMuted text-sm mt-1">Browse and join community-led environmental events.</p>
                </div>
                <Link
                    to="/dashboard/initiatives/create"
                    className="btn btn-default btn-primary whitespace-nowrap"
                >
                    + New Initiative
                </Link>
            </div>

            {/* Grid */}
            {initiatives.length === 0 ? (
                <div className="empty-state">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-xl font-bold text-textMain mb-1">No initiatives yet</h3>
                    <p className="text-textMuted mb-6">Be the first to organise a community green event.</p>
                    <Link to="/dashboard/initiatives/create" className="btn btn-default btn-primary">Create one now</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initiatives.map((initiative) => {
                        const canEditOrDelete = user && (user.id === initiative.organizer || user._id === initiative.organizer || user.role === 'admin');
                        return (
                            <div key={initiative._id} className="card flex flex-col hover:shadow-md transition-shadow group">
                                <div className={`h-1.5 w-full ${getAccentBar(initiative.status)}`} />
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-lg font-bold text-textMain leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                                                {initiative.title}
                                            </h2>
                                            {initiative.isOfficial && (
                                                <span className="badge badge-teal w-max">
                                                    ✓ City Endorsed
                                                </span>
                                            )}
                                        </div>
                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(initiative.status)}`}>
                                            {initiative.status}
                                        </span>
                                    </div>
                                    <p className="text-textMuted text-sm leading-relaxed line-clamp-3 mb-5">{initiative.description}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-textMuted">
                                            <span className="text-primary-500">📍</span>
                                            <span className="truncate font-medium">{initiative.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-textMuted">
                                            <span className="text-primary-500">📅</span>
                                            <span className="font-medium">{new Date(initiative.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-surfaceHover border-t border-border flex justify-between items-center">
                                    <Link to={`/dashboard/initiatives/${initiative._id}`} className="text-primary-600 hover:text-primary-800 font-semibold text-sm transition-colors">
                                        View Details →
                                    </Link>
                                    {canEditOrDelete && (
                                        <div className="flex items-center gap-1">
                                            <Link to={`/dashboard/initiatives/edit/${initiative._id}`} className="btn btn-sm btn-ghost">Edit</Link>
                                            <button onClick={() => setDeleteTarget({ id: initiative._id, title: initiative.title })} className="btn btn-sm btn-ghost text-red-500 hover:text-red-700 hover:bg-red-50">Delete</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GreenInitiativeList;