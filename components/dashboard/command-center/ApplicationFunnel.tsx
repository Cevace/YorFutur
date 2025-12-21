'use client';

import React from 'react';
import Link from 'next/link';
import { FunnelStats } from './types';
import { FileEdit, Send, MessageSquare, Gift, ArrowRight } from 'lucide-react';

interface ApplicationFunnelProps {
    stats: FunnelStats;
}

/**
 * ApplicationFunnel - Block C (KPIs)
 * Visual progress tracker showing the application pipeline
 * Pill-shaped counters with highlighted "Interviewing" status
 */
export default function ApplicationFunnel({ stats }: ApplicationFunnelProps) {
    const stages = [
        {
            key: 'drafts',
            label: 'Concepten',
            count: stats.drafts,
            icon: FileEdit,
            color: 'bg-slate-100 text-slate-600',
            pillColor: 'bg-slate-200',
            href: '/dashboard/tracker?filter=draft'
        },
        {
            key: 'applied',
            label: 'Gesolliciteerd',
            count: stats.applied,
            icon: Send,
            color: 'bg-slate-100 text-slate-600',
            pillColor: 'bg-slate-200',
            href: '/dashboard/tracker?filter=applied'
        },
        {
            key: 'interviewing',
            label: 'In gesprek',
            count: stats.interviewing,
            icon: MessageSquare,
            color: 'bg-orange-100 text-orange-700',
            pillColor: 'bg-orange-500',
            highlight: true,
            href: '/dashboard/tracker?filter=interview'
        },
        {
            key: 'offers',
            label: 'Aanbiedingen',
            count: stats.offers,
            icon: Gift,
            color: 'bg-green-100 text-green-700',
            pillColor: 'bg-green-500',
            href: '/dashboard/tracker?filter=offer'
        }
    ];

    const totalActive = stats.drafts + stats.applied + stats.interviewing + stats.offers;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                    Sollicitatie Funnel
                </h2>
                <span className="text-sm text-slate-500">
                    {totalActive} actief
                </span>
            </div>

            {/* Funnel visualization */}
            <div className="space-y-3 flex-1">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const percentage = totalActive > 0 ? (stage.count / totalActive) * 100 : 0;

                    return (
                        <Link
                            key={stage.key}
                            href={stage.href}
                            className={`block p-3 rounded-xl ${stage.color} transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${stage.highlight ? 'bg-orange-200' : 'bg-white/60'}`}>
                                        <Icon size={18} className={stage.highlight ? 'text-orange-600' : 'text-slate-500'} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium">
                                            {stage.label}
                                        </span>
                                        {stage.highlight && stage.count > 0 && (
                                            <div className="text-xs text-orange-600 font-medium mt-0.5">
                                                Actief bezig!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Count pill */}
                                <div className={`${stage.highlight ? 'bg-orange-500' : stage.count > 0 ? 'bg-slate-600' : 'bg-slate-300'} text-white text-sm font-bold px-3 py-1 rounded-full min-w-[2.5rem] text-center`}>
                                    {stage.count}
                                </div>
                            </div>

                            {/* Progress bar */}
                            {stage.count > 0 && (
                                <div className="mt-2 h-1 bg-white/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${stage.highlight ? 'bg-orange-400' : 'bg-slate-400'} rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.max(percentage, 10)}%` }}
                                    />
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <Link
                href="/dashboard/tracker"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-cevace-orange hover:text-orange-600 transition-colors group"
            >
                Bekijk alle sollicitaties
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
