'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgendaEvent, AIRecommendation } from './types';
import {
    Calendar,
    Sparkles,
    MapPin,
    Clock,
    ArrowRight,
    Briefcase,
    Send,
    AlertCircle
} from 'lucide-react';

interface OpportunityHubWidgetProps {
    agendaEvents: AgendaEvent[];
    aiRecommendations: AIRecommendation[];
}

/**
 * OpportunityHubWidget - Tabbed widget combining agenda and AI recommendations
 * Tab A: "Mijn Agenda" - Vertical timeline of interviews, deadlines, follow-ups
 * Tab B: "Aanbevolen Events" - AI-powered event suggestions
 */
export default function OpportunityHubWidget({
    agendaEvents,
    aiRecommendations
}: OpportunityHubWidgetProps) {
    const [activeTab, setActiveTab] = useState<'agenda' | 'recommendations'>('agenda');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const getEventIcon = (type: AgendaEvent['type']) => {
        switch (type) {
            case 'interview': return Briefcase;
            case 'deadline': return AlertCircle;
            case 'followup': return Send;
            default: return Calendar;
        }
    };

    const getEventTypeLabel = (type: AIRecommendation['eventType']) => {
        switch (type) {
            case 'conference': return 'Conferentie';
            case 'networking': return 'Netwerken';
            case 'webinar': return 'Webinar';
            case 'workshop': return 'Workshop';
            default: return 'Event';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            {/* Tab Header */}
            <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-full">
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all ${activeTab === 'agenda'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Calendar size={14} className="inline-block mr-1.5 -mt-0.5" />
                    Mijn Agenda
                </button>
                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all ${activeTab === 'recommendations'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Sparkles size={14} className="inline-block mr-1.5 -mt-0.5" />
                    Aanbevolen
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'agenda' ? (
                    <AgendaTab events={agendaEvents} formatDate={formatDate} getEventIcon={getEventIcon} />
                ) : (
                    <RecommendationsTab
                        recommendations={aiRecommendations}
                        formatDate={formatDate}
                        getEventTypeLabel={getEventTypeLabel}
                    />
                )}
            </div>

            {/* Bottom CTA */}
            <Link
                href={activeTab === 'agenda' ? '/dashboard/tracker' : '/events'}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-cevace-orange hover:text-orange-600 transition-colors group"
            >
                {activeTab === 'agenda' ? 'Bekijk volledige agenda' : 'Ontdek meer events'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}

// Agenda Tab Component
interface AgendaTabProps {
    events: AgendaEvent[];
    formatDate: (date: string) => string;
    getEventIcon: (type: AgendaEvent['type']) => React.ElementType;
}

function AgendaTab({ events, formatDate, getEventIcon }: AgendaTabProps) {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Calendar size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">Geen agenda items.</p>
                <p className="text-slate-400 text-xs mt-1">
                    Plan interviews en stel reminders in.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-cevace-almond" />

            <div className="space-y-4">
                {events.map((event, index) => {
                    const Icon = getEventIcon(event.type);
                    const isInterview = event.type === 'interview';
                    const isFollowup = event.type === 'followup';

                    return (
                        <div key={event.id} className="relative pl-10">
                            {/* Timeline dot */}
                            <div
                                className={`absolute left-2 top-3 w-5 h-5 rounded-full flex items-center justify-center ${isInterview
                                        ? 'bg-cevace-indigo'
                                        : isFollowup
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                            >
                                <Icon size={12} className="text-white" />
                            </div>

                            {/* Event card */}
                            <div className="bg-slate-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-xs text-cevace-lilac mb-1">
                                    <Clock size={12} />
                                    <span>{formatDate(event.date)}</span>
                                    {event.time && <span>• {event.time}</span>}
                                </div>
                                <div
                                    className="font-semibold text-slate-900"
                                    style={{ fontSize: '14px' }}
                                >
                                    {event.title}
                                </div>
                                <div className="text-xs text-cevace-grape mt-1">
                                    {event.company}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Recommendations Tab Component
interface RecommendationsTabProps {
    recommendations: AIRecommendation[];
    formatDate: (date: string) => string;
    getEventTypeLabel: (type: AIRecommendation['eventType']) => string;
}

function RecommendationsTab({ recommendations, formatDate, getEventTypeLabel }: RecommendationsTabProps) {
    if (recommendations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Sparkles size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">Geen aanbevelingen beschikbaar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recommendations.map((rec) => (
                <div
                    key={rec.id}
                    className="relative rounded-xl p-4 bg-gradient-to-br from-white to-slate-50"
                    style={{
                        border: '1px solid',
                        borderColor: '#C9ADA7' // cevace-almond
                    }}
                >
                    {/* AI Tip Badge */}
                    <div className="absolute -top-2 right-3">
                        <span
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: '#9A8C98', // cevace-lilac
                                color: 'white'
                            }}
                        >
                            <Sparkles size={10} />
                            AI Tip
                        </span>
                    </div>

                    {/* Event Type */}
                    <div className="text-xs font-medium text-cevace-orange mb-1">
                        {getEventTypeLabel(rec.eventType)}
                    </div>

                    {/* Title */}
                    <div
                        className="font-semibold text-slate-900 mb-2"
                        style={{ fontSize: '16px' }}
                    >
                        {rec.title}
                    </div>

                    {/* Location & Date */}
                    <div className="flex items-center gap-3 text-xs text-cevace-grape mb-3">
                        <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {rec.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(rec.date)}
                        </span>
                    </div>

                    {/* AI Reasoning */}
                    <div
                        className="text-xs p-2 rounded-lg"
                        style={{
                            backgroundColor: '#F2E9E4', // cevace-parchment
                            color: '#4A4E69' // cevace-grape
                        }}
                    >
                        💡 {rec.relevanceReason}
                    </div>
                </div>
            ))}
        </div>
    );
}
