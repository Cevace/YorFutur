'use client';

import { useState } from 'react';
import { addExperience, updateExperience } from '@/actions/experience';
import { Plus, X, Pencil } from 'lucide-react';

interface ExperienceFormProps {
    initialData?: {
        id: string;
        job_title: string;
        company: string;
        start_date: string;
        end_date?: string;
        description?: string;
    };
}

export default function ExperienceForm({ initialData }: ExperienceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);

        let result;
        if (initialData) {
            formData.append('id', initialData.id);
            result = await updateExperience(formData);
        } else {
            result = await addExperience(formData);
        }

        setIsPending(false);

        if (result?.success) {
            setIsOpen(false);
        } else {
            alert('Er ging iets mis: ' + result?.error);
        }
    }

    if (!isOpen) {
        if (initialData) {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 text-black hover:bg-cevace-orange hover:text-white transition-all shadow-sm border border-orange-100"
                    title="Wijzigen"
                >
                    <Pencil size={16} />
                </button>
            );
        }
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-cevace-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
                <Plus size={20} />
                Toevoegen
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-cevace-blue">
                        {initialData ? 'Werkervaring Wijzigen' : 'Werkervaring Toevoegen'}
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Functietitel</label>
                        <input
                            name="jobTitle"
                            defaultValue={initialData?.job_title}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf</label>
                        <input
                            name="company"
                            defaultValue={initialData?.company}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                            <input
                                type="date"
                                name="startDate"
                                defaultValue={initialData?.start_date}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einddatum</label>
                            <input
                                type="date"
                                name="endDate"
                                defaultValue={initialData?.end_date || ''}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Laat leeg indien huidig</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                        <textarea
                            name="description"
                            defaultValue={initialData?.description}
                            rows={6}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none whitespace-pre-wrap"
                            placeholder="Gebruik - voor bulletpoints"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-cevace-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                        >
                            {isPending ? 'Opslaan...' : 'Opslaan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
