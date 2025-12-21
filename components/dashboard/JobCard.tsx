'use client';

import { useState } from 'react';
import { UserSearch, Zap, ExternalLink } from 'lucide-react';
import { JobResult } from '@/actions/job-search';

interface JobCardProps {
    job: JobResult;
    onFindManager: (jobTitle: string, companyName: string) => void;
    onGeneratePitch: (jobTitle: string, companyName: string) => void;
}

export default function JobCard({ job, onFindManager, onGeneratePitch }: JobCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-gray-400 transition-all">
            {/* Header */}
            <div className="mb-4 relative">
                {/* Freshness Badge if applicable */}
                {(() => {
                    const isNew = (() => {
                        try {
                            const date = new Date(job.postedDate);
                            // Valid date check
                            if (isNaN(date.getTime())) {
                                // Fallback for relative strings like "22 uur geleden"
                                const str = job.postedDate.toLowerCase();
                                return str.includes('uur') || str.includes('minuut') || str.includes('net');
                            }
                            return (new Date().getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
                        } catch {
                            return false;
                        }
                    })();

                    if (isNew) {
                        return (
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                NIEUW
                            </span>
                        );
                    }
                    return null;
                })()}

                <h3 className="font-bold text-gray-900 mb-1 pr-8" style={{ fontSize: '18px' }}>
                    {job.title}
                </h3>
                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{job.postedDate}</p>
                </div>
            </div>

            {/* Snippet */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {job.snippet}
            </p>

            {/* Action Buttons */}
            <div className="space-y-2">
                {/* View Job - TOP, Orange */}
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-cevace-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
                >
                    <ExternalLink size={16} />
                    Bekijk Vacature
                </a>

                {/* Generate Pitch - MIDDLE, Almond Silk #C9ADA7 */}
                <button
                    onClick={() => onGeneratePitch(job.title, job.company)}
                    className="w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-colors text-sm"
                    style={{ backgroundColor: '#C9ADA7' }}
                >
                    <Zap size={16} />
                    Maak Pitch
                </button>

                {/* Find Manager - BOTTOM, Lilac Ash #9A8C98 */}
                <button
                    onClick={() => onFindManager(job.title, job.company)}
                    className="w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                    style={{ backgroundColor: '#9A8C98' }}
                >
                    <UserSearch size={16} />
                    Vind Manager
                </button>
            </div>
        </div>
    );
}
