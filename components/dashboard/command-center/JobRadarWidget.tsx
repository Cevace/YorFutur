'use client';

import React from 'react';
import Link from 'next/link';
import { JobMatch } from './types';
import { MapPin, ArrowRight, Sparkles, Building2, Bell, BellOff, Clock } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { nl } from 'date-fns/locale';

interface JobRadarWidgetProps {
    matches: JobMatch[];
}

/**
 * JobRadarWidget - Block D (Top Picks)
 * Shows top 3 job matches with company info and match score badge
 */
export default function JobRadarWidget({ matches }: JobRadarWidgetProps) {
    const { isSupported, subscription, subscribeToPush, unsubscribeFromPush, loading } = usePushNotifications();

    // Take top 3 matches sorted by score
    const topMatches = [...matches]
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 3);

    const getMatchBadgeStyle = (score: number) => {
        if (score >= 90) {
            return 'bg-green-100 text-green-700 border-green-200';
        } else if (score >= 80) {
            return 'bg-blue-100 text-blue-700 border-blue-200';
        } else {
            return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const isFresh = (dateString: string) => {
        const date = new Date(dateString);
        return differenceInHours(new Date(), date) < 24;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles size={20} className="text-cevace-orange" />
                    Job Radar
                </h2>

                {/* Notification Toggle or Status */}
                {isSupported && (
                    <button
                        onClick={subscription ? unsubscribeFromPush : subscribeToPush}
                        disabled={loading}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${subscription
                                ? 'bg-green-50 text-green-700 cursor-pointer hover:bg-green-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        title={subscription ? 'Klik om alerts uit te zetten' : 'Zet notificaties aan voor nieuwe matches'}
                    >
                        {loading ? (
                            <span className="w-3 h-3 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                        ) : subscription ? (
                            <>
                                <Bell size={12} />
                                <span>Alerts actief</span>
                            </>
                        ) : (
                            <>
                                <BellOff size={12} />
                                <span>Alerts aan</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {topMatches.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Building2 size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">
                        Nog geen matches gevonden.
                    </p>
                    <Link
                        href="/dashboard/radar"
                        className="mt-3 text-sm font-medium text-cevace-orange hover:text-orange-600"
                    >
                        Stel je voorkeuren in →
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-3 flex-1">
                        {topMatches.map((job) => {
                            const fresh = isFresh(job.posted_at);

                            return (
                                <Link
                                    key={job.id}
                                    href={`/dashboard/radar?job=${job.id}`}
                                    className="block p-4 rounded-xl bg-slate-50 hover:bg-orange-50/50 transition-all duration-200 group relative"
                                >
                                    {/* Freshness Badge */}
                                    {fresh && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm" title="Nieuw (< 24u)" />
                                    )}

                                    <div className="flex items-start gap-3">
                                        {/* Company logo placeholder */}
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Building2 size={20} className="text-slate-400" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 pr-6"> {/* pr-6 for badge space */}
                                                    <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-cevace-orange transition-colors">
                                                        {job.job_title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {job.company_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                {/* Location & Time */}
                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        <span className="truncate max-w-[80px]">{job.location}</span>
                                                    </div>

                                                    {fresh ? (
                                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                                            <Clock size={12} />
                                                            Nieuw
                                                        </span>
                                                    ) : (
                                                        <span>{formatDistanceToNow(new Date(job.posted_at), { addSuffix: true, locale: nl })}</span>
                                                    )}
                                                </div>

                                                {/* Match Score */}
                                                <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getMatchBadgeStyle(job.match_score)}`}>
                                                    {job.match_score}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-gray-50 pt-3">
                        <span>Check dagelijks om 08:00</span>
                        <Link
                            href="/dashboard/radar"
                            className="flex items-center gap-1 font-medium text-cevace-orange hover:text-orange-600 transition-colors group"
                        >
                            Alle matches
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
