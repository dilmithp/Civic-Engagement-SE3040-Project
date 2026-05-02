import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';
import { useAuth } from '../../hooks/useAuth';
import CompletionImageUpload from './CompletionImageUpload';

const statusStyle = (status) => {
    switch (status) {
        case 'Upcoming': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
        case 'Upcoming (Weather Alert)': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'Ongoing': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
        case 'Completed': return 'bg-primary-50 text-textMuted';
        default: return 'bg-primary-50 text-textMuted';
    }
};

const getWeatherIcon = (condition) => {
    switch (condition) {
        case 'Clear': return '☀️';
        case 'Clouds': return '☁️';
        case 'Rain': return '🌧️';
        case 'Drizzle': return '🌦️';
        case 'Thunderstorm': return '⛈️';
        case 'Snow': return '❄️';
        case 'Extreme': return '🌪️';
        default: return '🌤️';
    }
};

const InitiativeDetails = () => {
    const { id } = useParams();
    const [initiative, setInitiative] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const { user } = useAuth();

    const handleDeleteImage = async (imageId) => {
        setDeletingImageId(imageId);
        try {
            const response = await greenInitiativeService.deleteCompletionImage(id, imageId);
            // Update local state with the returned initiative (images array already trimmed)
            const updated = response.data?.data || response.data || response;
            setInitiative(updated);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete image. Please try again.');
        } finally {
            setDeletingImageId(null);
            setConfirmDeleteId(null);
        }
    };

    useEffect(() => {
        const fetchInitiative = async () => {
            try {
                const response = await greenInitiativeService.getInitiativeById(id);
                setInitiative(response.data || response);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchInitiative();
    }, [id]);

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-5 w-36 bg-surface rounded mb-8" />
            <div className="card p-8 space-y-4">
                <div className="h-8 bg-border rounded w-2/3" />
                <div className="h-4 bg-border rounded w-full" />
                <div className="h-4 bg-border rounded w-5/6" />
            </div>
        </div>
    );

    if (error || !initiative) return (
        <div className="max-w-3xl mx-auto py-20 text-center">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="text-xl font-bold text-textMain mb-2">Initiative not found</h2>
            <p className="text-textMuted mb-6">This initiative may have been removed or doesn't exist.</p>
            <Link to="/dashboard/initiatives" className="btn btn-default btn-primary">← Back to Initiatives</Link>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Completion image upload modal */}
            {showUpload && (
                <CompletionImageUpload
                    initiativeId={id}
                    initiativeTitle={initiative.title}
                    onSkip={() => setShowUpload(false)}
                    onSuccess={(updated) => {
                        if (updated) setInitiative(updated);
                        setShowUpload(false);
                    }}
                />
            )}
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Link to="/dashboard/initiatives" className="text-textMuted hover:text-textMain transition-colors">← Back</Link>
                <h1 className="text-2xl font-bold text-textMain">Initiative Details</h1>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">🌿</span>
                        <div className="flex-1">
                            <h2 className="card-title flex items-center flex-wrap gap-2">
                                {initiative.title}
                                {initiative.isOfficial && (
                                    <span className="badge badge-teal">✓ Official</span>
                                )}
                            </h2>
                        </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusStyle(initiative.status)}`}>
                        {initiative.status}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Weather Alert */}
                    {initiative.status === 'Upcoming (Weather Alert)' && initiative.weatherForecast && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">⚠️ Weather Advisory</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                Forecast for <strong>{initiative.weatherForecast.condition.toLowerCase()}</strong> ({initiative.weatherForecast.description}). Please dress appropriately.
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">About this Initiative</p>
                        <p className="text-textMain text-sm leading-relaxed">{initiative.description}</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="kpi-card">
                            <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">📍 Location</p>
                            <p className="text-textMain font-semibold text-sm">{initiative.location}</p>
                        </div>
                        <div className="kpi-card">
                            <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">📅 Date & Time</p>
                            <p className="text-textMain font-semibold text-sm">
                                {new Date(initiative.date).toLocaleString('en-US', {
                                    weekday: 'short', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                        {initiative.weatherForecast && (
                            <div className="kpi-card">
                                <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">
                                    {getWeatherIcon(initiative.weatherForecast.condition)} Forecast
                                </p>
                                <p className="text-textMain font-semibold text-sm capitalize">
                                    {Math.round(initiative.weatherForecast.temp)}°C, {initiative.weatherForecast.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Event Gallery — shown for completed initiatives */}
                    {initiative.status === 'Completed' && (() => {
                        const canUpload = user && (
                            user.id === initiative.organizer ||
                            user._id === initiative.organizer ||
                            user.role === 'admin'
                        );
                        const hasImages = initiative.completionImages?.length > 0;
                        return (
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-textMuted uppercase tracking-wider">📸 Event Gallery</p>
                                    {canUpload && (
                                        <button
                                            onClick={() => setShowUpload(true)}
                                            className="btn btn-sm btn-ghost px-3 py-1.5 text-xs rounded border border-border hover:border-primary-400 hover:text-primary-600 transition-colors"
                                        >
                                            + Add Photos
                                        </button>
                                    )}
                                </div>
                                {hasImages ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {initiative.completionImages.map((img, i) => {
                                            const isConfirming = confirmDeleteId === img._id;
                                            const isDeleting  = deletingImageId === img._id;
                                            return (
                                                <div
                                                    key={img._id || i}
                                                    className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-surfaceHover"
                                                >
                                                    {/* Image — links to full-size in new tab */}
                                                    <a
                                                        href={img.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full h-full"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={`Event photo ${i + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    </a>

                                                    {/* Delete controls — organizer/admin only */}
                                                    {canUpload && (
                                                        <div className="absolute inset-0 pointer-events-none">
                                                            {isDeleting ? (
                                                                /* Spinner overlay while deleting */
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
                                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                </div>
                                                            ) : isConfirming ? (
                                                                /* Confirm / Cancel overlay */
                                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 pointer-events-auto rounded-xl">
                                                                    <p className="text-white text-xs font-semibold px-2 text-center">Delete this photo?</p>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(img._id); }}
                                                                            className="px-3 py-1 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                                            className="px-3 py-1 text-xs font-bold bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* Trash icon — appears on hover */
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(img._id); }}
                                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto shadow-md"
                                                                    title="Delete photo"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center rounded-xl border border-dashed border-border bg-surfaceHover">
                                        <p className="text-3xl mb-2">🖼️</p>
                                        <p className="text-textMuted text-sm">No event photos yet.</p>
                                        {canUpload && (
                                            <button
                                                onClick={() => setShowUpload(true)}
                                                className="mt-3 btn btn-sm btn-default btn-primary text-xs"
                                            >
                                                Upload Photos
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="pt-2 border-t border-border flex justify-end">
                        <Link to="/dashboard/initiatives" className="btn btn-default btn-ghost">
                            ← Back to all initiatives
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitiativeDetails;