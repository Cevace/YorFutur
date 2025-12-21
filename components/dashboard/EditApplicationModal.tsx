'use client';

import { JobApplication, updateApplication } from '@/actions/tracker';
import { X } from 'lucide-react';
import { useState } from 'react';

interface EditApplicationModalProps {
    application: JobApplication | null;
    onClose: () => void;
}

export default function EditApplicationModal({ application, onClose }: EditApplicationModalProps) {
    const [isPending, setIsPending] = useState(false);

    if (!application) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!application) return;

        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateApplication(application.id, formData);

        setIsPending(false);

        if (result.success) {
            onClose();
        } else {
            alert('Fout: ' + result.error);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900" style={{ fontSize: '20px' }}>Sollicitatie bewerken</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bedrijfsnaam *
                        </label>
                        <input
                            type="text"
                            name="company_name"
                            required
                            defaultValue={application.company_name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Functietitel *
                        </label>
                        <input
                            type="text"
                            name="job_title"
                            required
                            defaultValue={application.job_title}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recruiter naam
                        </label>
                        <input
                            type="text"
                            name="recruiter_name"
                            defaultValue={application.recruiter_name || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vacature URL
                        </label>
                        <input
                            type="url"
                            name="application_url"
                            defaultValue={application.application_url || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notities
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            defaultValue={application.notes || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Datum Velden */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3" style={{ fontSize: '20px' }}>Agenda</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline_date"
                                    defaultValue={application.deadline_date?.split('T')[0] || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Interview
                                </label>
                                <input
                                    type="date"
                                    name="interview_date"
                                    defaultValue={application.interview_date?.split('T')[0] || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Follow-up
                                </label>
                                <input
                                    type="date"
                                    name="follow_up_date"
                                    defaultValue={application.follow_up_date?.split('T')[0] || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-6 py-3 bg-cevace-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Bezig...' : 'Opslaan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
