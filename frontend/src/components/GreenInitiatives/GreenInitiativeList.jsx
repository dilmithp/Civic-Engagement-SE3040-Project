import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';
import { useAuth } from '../../hooks/useAuth';

const GreenInitiativeList = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
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
            case 'Upcoming':  return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
            case 'Ongoing':   return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
            case 'Completed': return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
            default:          return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
        }
    };

    const getAccentBar = (status) => {
        switch (status) {
            case 'Upcoming':  return 'bg-sky-400';
            case 'Ongoing':   return 'bg-emerald-500';
            case 'Completed': return 'bg-slate-400';
            default:          return 'bg-slate-400';
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
                <div className="h-9 w-72 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                        <div className="h-1.5 bg-gray-200" />
                        <div className="p-6 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-100 rounded w-full" />
                            <div className="h-4 bg-gray-100 rounded w-5/6" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex flex-col items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-semibold">{error}</p>
                <button onClick={fetchInitiatives} className="mt-1 text-sm font-medium underline hover:no-underline">Try again</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !deleting && setDeleteTarget(null)}
                    />
                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 animate-[fadeInUp_0.18s_ease]">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-100 mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-extrabold text-gray-900 text-center mb-1">Delete Initiative</h3>
                        <p className="text-sm text-gray-500 text-center mb-1">
                            You're about to permanently delete
                        </p>
                        <p className="text-sm font-semibold text-gray-800 text-center mb-6 px-4 line-clamp-2">
                            "{deleteTarget.title}"
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-6">This action cannot be undone.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                        Deleting…
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Yes, Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">🌿</span>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Green Initiatives</h1>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">Browse and join community-led environmental events.</p>
                        </div>
                        <Link
                            to="/green-initiatives/create"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            New Initiative
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {initiatives.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">🌱</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-1">No initiatives yet</h3>
                        <p className="text-gray-500 mb-6">Be the first to organise a community green event.</p>
                        <Link to="/green-initiatives/create" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            Create one now
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initiatives.map((initiative) => {
                            // NEW: Check if user owns the post OR if the user is an admin!
                            const canEditOrDelete = user && (user.id === initiative.organizer || user._id === initiative.organizer || user.role === 'admin');

                            return (
                                <div key={initiative._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col overflow-hidden transition-shadow duration-200 group">
                                    {/* Accent top bar */}
                                    <div className={`h-1.5 w-full ${getAccentBar(initiative.status)}`} />

                                    <div className="p-6 flex-grow">
                                        <div className="flex justify-between items-start gap-3 mb-3">

                                            <div className="flex flex-col gap-2">
                                                <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                                                    {initiative.title}
                                                </h2>

                                                {/* THE OFFICIAL VERIFIED BADGE */}
                                                {initiative.isOfficial && (
                                                    <span className="inline-flex w-max items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        City Endorsed
                                                    </span>
                                                )}
                                            </div>

                                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(initiative.status)}`}>
                                                {initiative.status}
                                            </span>
                                        </div>

                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5">
                                            {initiative.description}
                                        </p>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate font-medium">{initiative.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span className="font-medium">{new Date(initiative.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                        <Link
                                            to={`/green-initiatives/${initiative._id}`}
                                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm transition-colors"
                                        >
                                            View Details
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                        </Link>

                                        {/* NEW: Replaced isOwner with canEditOrDelete */}
                                        {canEditOrDelete && (
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    to={`/green-initiatives/edit/${initiative._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget({ id: initiative._id, title: initiative.title })}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GreenInitiativeList;