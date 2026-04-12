import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import greenInitiativeService from '../../services/greenInitiative.service';

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