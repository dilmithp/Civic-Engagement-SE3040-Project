import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';

const statusStyle = (status) => {
    switch (status) {
        case 'Upcoming':  return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
        case 'Ongoing':   return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
        case 'Completed': return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
        default:          return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    }
};

const accentBar = (status) => {
    switch (status) {
        case 'Upcoming':  return 'from-sky-400 to-sky-500';
        case 'Ongoing':   return 'from-emerald-400 to-green-600';
        case 'Completed': return 'from-slate-300 to-slate-400';
        default:          return 'from-green-400 to-green-600';
    }
};

const InitiativeDetails = () => {
    const { id } = useParams();
    const [initiative, setInitiative] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchInitiative = async () => {
            try {
                const response = await greenInitiativeService.getInitiativeById(id);
                setInitiative(response.data || response);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchInitiative();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="h-5 w-36 bg-gray-200 rounded-lg animate-pulse mb-8" />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-2 bg-gray-200" />
                    <div className="px-8 py-8 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                        <div className="h-4 bg-gray-100 rounded w-4/6" />
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="h-20 bg-gray-100 rounded-xl" />
                            <div className="h-20 bg-gray-100 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !initiative) return (
        <div className="min-h-screen bg-gray-50 py-20 px-4 text-center">
            <div className="max-w-md mx-auto">
                <div className="text-5xl mb-4">🌿</div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">Initiative not found</h2>
                <p className="text-gray-500 mb-6">This initiative may have been removed or doesn't exist.</p>
                <Link to="/green-initiatives" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow transition-all text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Initiatives
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link
                    to="/green-initiatives"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-700 mb-8 transition-colors group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Initiatives
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Gradient accent bar */}
                    <div className={`h-2 w-full bg-gradient-to-r ${accentBar(initiative.status)}`} />

                    {/* Title section */}
                    <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xl">🌿</span>
                                </div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
                                    {initiative.title}
                                </h1>
                            </div>
                            <span className={`shrink-0 self-start px-3 py-1.5 rounded-full text-xs font-bold ${statusStyle(initiative.status)}`}>
                                {initiative.status}
                            </span>
                        </div>
                    </div>

                    <div className="px-8 py-8 space-y-8">
                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">About this Initiative</h3>
                            <p className="text-gray-700 leading-relaxed text-sm">{initiative.description}</p>
                        </div>

                        {/* Metadata cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4.5 h-4.5 w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                                    <p className="text-gray-900 font-semibold text-sm">{initiative.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date &amp; Time</p>
                                    <p className="text-gray-900 font-semibold text-sm">
                                        {new Date(initiative.date).toLocaleString('en-US', {
                                            weekday: 'short', year: 'numeric', month: 'long',
                                            day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer action */}
                        <div className="pt-2 border-t border-gray-100 flex justify-end">
                            <Link
                                to="/green-initiatives"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to all initiatives
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitiativeDetails;

