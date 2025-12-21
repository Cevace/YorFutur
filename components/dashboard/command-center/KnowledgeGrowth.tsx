'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, UpcomingEvent } from './types';
import {
    BookOpen,
    Calendar,
    Clock,
    ArrowRight,
    Video,
    Users,
    Presentation
} from 'lucide-react';

interface KnowledgeGrowthProps {
    blogPosts: BlogPost[];
    events: UpcomingEvent[];
}

/**
 * KnowledgeGrowth - Block E
 * Mixed feed of latest blog post and upcoming events
 * Now uses dynamic blog data with real cover images
 */
export default function KnowledgeGrowth({ blogPosts, events }: KnowledgeGrowthProps) {
    const latestPost = blogPosts[0];
    const upcomingEvents = events.slice(0, 2);

    const getEventIcon = (type: UpcomingEvent['type']) => {
        switch (type) {
            case 'webinar': return Video;
            case 'workshop': return Presentation;
            case 'networking': return Users;
            default: return Calendar;
        }
    };

    const getEventTypeLabel = (type: UpcomingEvent['type']) => {
        switch (type) {
            case 'webinar': return 'Webinar';
            case 'workshop': return 'Workshop';
            case 'networking': return 'Netwerk';
            default: return 'Event';
        }
    };

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    // Calculate reading time if not provided (average 200 words per minute)
    const getReadingTime = (post: BlogPost) => {
        return post.reading_time || 5; // Default to 5 minutes
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen size={20} className="text-cevace-blue" />
                    Kennis & Groei
                </h2>
            </div>

            <div className="space-y-4 flex-1">
                {/* Latest blog post with real cover image */}
                {latestPost && (
                    <Link
                        href={`/blog/${latestPost.slug}`}
                        className="block group"
                    >
                        <div className="relative overflow-hidden rounded-xl h-28 mb-3">
                            {latestPost.coverImage ? (
                                <Image
                                    src={latestPost.coverImage}
                                    alt={latestPost.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <BookOpen size={32} className="text-slate-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                            {/* Category badge */}
                            <div className="absolute top-2 left-2">
                                <span className="text-xs font-medium text-white bg-cevace-blue/80 px-2 py-1 rounded">
                                    {latestPost.category}
                                </span>
                            </div>
                        </div>

                        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-cevace-orange transition-colors line-clamp-2">
                            {latestPost.title}
                        </h3>

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {getReadingTime(latestPost)} min
                            </span>
                            <span>Nieuwste artikel</span>
                        </div>
                    </Link>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Upcoming events */}
                <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        Aankomende events
                    </h3>

                    {upcomingEvents.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            Geen geplande events.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingEvents.map(event => {
                                const EventIcon = getEventIcon(event.type);

                                return (
                                    <Link
                                        key={event.id}
                                        href={event.registrationUrl}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <EventIcon size={16} className="text-cevace-blue" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-cevace-orange transition-colors">
                                                {event.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{formatEventDate(event.date)}</span>
                                                <span>•</span>
                                                <span>{event.time}</span>
                                                <span className="text-cevace-blue font-medium">
                                                    {getEventTypeLabel(event.type)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA */}
            <Link
                href="/blog"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-cevace-orange hover:text-orange-600 transition-colors group"
            >
                Bekijk alle content
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
