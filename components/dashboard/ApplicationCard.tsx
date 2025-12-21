'use client';

import { JobApplication } from '@/actions/tracker';
import { Building2, User, AlertCircle, Trash2, Edit, Calendar, Clock, Bell } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper om datum te formatteren
function formatDate(dateString: string | null): string | null {
    if (!dateString) return null;
    try {
        return format(new Date(dateString), 'd MMM', { locale: nl });
    } catch {
        return null;
    }
}

interface ApplicationCardProps {
    application: JobApplication;
    onEdit: (application: JobApplication) => void;
    onDelete: (id: string) => void;
}

export default function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Check if follow-up is needed (>7 days in 'applied' status)
    const needsFollowUp = application.status === 'applied' &&
        differenceInDays(new Date(), new Date(application.last_updated_at)) > 7;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-move group"
        >
            {/* Follow-up reminder badge */}
            {needsFollowUp && (
                <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded mb-3 font-medium">
                    <AlertCircle size={14} />
                    Follow-up nodig!
                </div>
            )}

            {/* Company name */}
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2" style={{ fontSize: '16px', letterSpacing: '-0.02em' }}>
                <Building2 size={16} className="text-cevace-orange flex-shrink-0" />
                <span className="truncate">{application.company_name}</span>
            </h3>

            {/* Job title */}
            <p className="text-gray-600 text-sm mb-2 truncate">{application.job_title}</p>

            {/* Recruiter name */}
            {application.recruiter_name && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <User size={12} />
                    <span className="truncate">{application.recruiter_name}</span>
                </div>
            )}

            {/* Datum badges */}
            {(application.interview_date || application.deadline_date || application.follow_up_date) && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {application.interview_date && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            <Calendar size={10} />
                            {formatDate(application.interview_date)}
                        </span>
                    )}
                    {application.deadline_date && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            <Clock size={10} />
                            {formatDate(application.deadline_date)}
                        </span>
                    )}
                    {application.follow_up_date && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            <Bell size={10} />
                            {formatDate(application.follow_up_date)}
                        </span>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(application);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded transition-colors"
                >
                    <Edit size={12} />
                    Bewerk
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Weet je zeker dat je de sollicitatie bij ${application.company_name} wilt verwijderen?`)) {
                            onDelete(application.id);
                        }
                    }}
                    className="flex items-center justify-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded transition-colors"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
}
