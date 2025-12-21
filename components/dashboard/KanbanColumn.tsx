'use client';

import { JobApplication } from '@/actions/tracker';
import ApplicationCard from './ApplicationCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { differenceInDays } from 'date-fns';

interface KanbanColumnProps {
    title: string;
    status: JobApplication['status'];
    applications: JobApplication[];
    onEdit: (application: JobApplication) => void;
    onDelete: (id: string) => void;
    color: string;
    customColor?: string;
}

export default function KanbanColumn({
    title,
    status,
    applications,
    onEdit,
    onDelete,
    color,
    customColor
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    const count = applications.length;

    // Calculate follow-up count (only for "applied" status)
    const followUpCount = status === 'applied'
        ? applications.filter(app =>
            differenceInDays(new Date(), new Date(app.last_updated_at)) > 7
        ).length
        : 0;

    return (
        <div className="flex-1 min-w-[240px] flex flex-col">
            {/* Column header */}
            <div
                className={customColor ? 'rounded-t-xl p-4' : `${color} rounded-t-xl p-4`}
                style={customColor ? { backgroundColor: customColor } : undefined}
            >
                <h2 className="font-bold text-white flex items-center justify-between" style={{ fontSize: '18px' }}>
                    <span>{title}</span>
                    <div className="flex items-center gap-2">
                        {/* Follow-up badge (iOS style) */}
                        {followUpCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {followUpCount}
                            </span>
                        )}
                        {/* Count badge */}
                        <span className="bg-white/20 px-2 py-1 rounded-full text-sm">{count}</span>
                    </div>
                </h2>
            </div>

            {/* Droppable area */}
            <div
                ref={setNodeRef}
                className={`flex-1 bg-gray-50 p-4 rounded-b-xl min-h-[500px] transition-colors ${isOver ? 'bg-blue-50 ring-2 ring-yorfutur-blue' : ''
                    }`}
            >
                <SortableContext
                    items={applications.map(app => app.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {applications.map((application) => (
                            <ApplicationCard
                                key={application.id}
                                application={application}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {applications.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                Nog geen sollicitaties
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
