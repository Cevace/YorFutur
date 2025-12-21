'use client';

import { addApplication } from '@/actions/tracker';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AddApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddApplicationModal({ isOpen, onClose }: AddApplicationModalProps) {
    const [isPending, setIsPending] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const result = await addApplication(formData);

        setIsPending(false);

        if (result.success) {
            onClose();
            (e.target as HTMLFormElement).reset();
        } else {
            alert('Fout: ' + result.error);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Nieuwe Sollicitatie</h2>
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            placeholder="Google, Microsoft, etc."
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            placeholder="Frontend Developer, Product Manager, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recruiter naam
                        </label>
                        <input
                            type="text"
                            name="recruiter_name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            placeholder="Jan Jansen"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vacature URL
                        </label>
                        <input
                            type="url"
                            name="application_url"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notities
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent resize-none"
                            placeholder="Extra informatie over deze sollicitatie..."
                        />
                    </div>

                    {/* Datum Velden */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Agenda</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline_date"
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
                            {isPending ? 'Bezig...' : 'Toevoegen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
