'use client';

import { JobApplication, updateApplicationStatus, deleteApplication } from '@/actions/tracker';
import KanbanColumn from './KanbanColumn';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import ApplicationCard from './ApplicationCard';

interface KanbanBoardProps {
    initialApplications: JobApplication[];
    onEdit: (application: JobApplication) => void;
}

const COLUMNS = [
    { id: 'applied' as const, title: 'Gesolliciteerd', color: 'bg-slate-700' },
    { id: 'response' as const, title: 'Reactie', color: 'bg-slate-600' },
    { id: 'interview' as const, title: 'Gesprek', color: 'bg-slate-500' },
    { id: 'offer' as const, title: 'Aanbod', color: 'bg-emerald-700' },
    { id: 'rejected' as const, title: 'Afgewezen', color: '' as any, customColor: '#EB3E1B' },
];

export default function KanbanBoard({ initialApplications, onEdit }: KanbanBoardProps) {
    const [applications, setApplications] = useState(initialApplications);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const activeApplication = activeId
        ? applications.find(app => app.id === activeId)
        : null;

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const applicationId = active.id as string;
        const newStatus = over.id as JobApplication['status'];

        const application = applications.find(app => app.id === applicationId);
        if (!application || application.status === newStatus) return;

        // Optimistic update
        setApplications(apps =>
            apps.map(app =>
                app.id === applicationId
                    ? { ...app, status: newStatus, last_updated_at: new Date().toISOString() }
                    : app
            )
        );

        // Server update
        const result = await updateApplicationStatus(applicationId, newStatus);
        if (!result.success) {
            // Revert on error
            setApplications(apps =>
                apps.map(app =>
                    app.id === applicationId
                        ? { ...app, status: application.status }
                        : app
                )
            );
            alert('Fout bij het updaten: ' + result.error);
        }
    }

    async function handleDelete(id: string) {
        // Optimistic delete
        setApplications(apps => apps.filter(app => app.id !== id));

        const result = await deleteApplication(id);
        if (!result.success) {
            // Revert on error
            setApplications(initialApplications);
            alert('Fout bij het verwijderen: ' + result.error);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={(event) => setActiveId(event.active.id as string)}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-6">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        title={column.title}
                        status={column.id}
                        applications={applications.filter(app => app.status === column.id)}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        color={column.color}
                        customColor={(column as any).customColor}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeApplication ? (
                    <div className="rotate-3 scale-105">
                        <ApplicationCard
                            application={activeApplication}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
