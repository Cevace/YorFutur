'use client';

import { JobApplication } from '@/actions/tracker';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import AddApplicationModal from '@/components/dashboard/AddApplicationModal';
import EditApplicationModal from '@/components/dashboard/EditApplicationModal';
import TrackerInfoPanel from '@/components/dashboard/TrackerInfoPanel';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface TrackerClientProps {
    applications: JobApplication[];
}

export default function TrackerClient({ applications }: TrackerClientProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-bold text-cevace-blue" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                    Sollicitatie Tracker
                </h1>
                <p className="text-gray-600 mt-2 mb-4">
                    Volg je sollicitaties van start tot finish
                </p>

                {/* Button + Info Panel Row */}
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex-shrink-0 h-[60px]"
                    >
                        <Plus size={20} />
                        Nieuwe Sollicitatie
                    </button>

                    {/* Info Panel */}
                    <TrackerInfoPanel />
                </div>
            </div>

            {/* Kanban Board */}
            <KanbanBoard
                initialApplications={applications}
                onEdit={(app) => setEditingApplication(app)}
            />

            {/* Modals */}
            <AddApplicationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
            <EditApplicationModal
                application={editingApplication}
                onClose={() => setEditingApplication(null)}
            />
        </div>
    );
}
