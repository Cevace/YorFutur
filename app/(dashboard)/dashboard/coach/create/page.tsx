'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createApplication } from '@/actions/interview-coach/applications';
import { ArrowLeft, Briefcase, Building2, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateApplicationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        company_name: '',
        job_title: '',
        vacancy_text: '',
        cv_snapshot: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await createApplication({
            company_name: formData.company_name,
            job_title: formData.job_title,
            vacancy_text: formData.vacancy_text || undefined,
            cv_snapshot: formData.cv_snapshot || undefined,
        });

        if (result.success) {
            router.push('/dashboard/coach');
        } else {
            setError(result.error || 'Er ging iets mis');
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Back Button */}
                <Link
                    href="/dashboard/coach"
                    className="inline-flex items-center gap-2 text-cevace-blue hover:text-blue-900 mb-8 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Terug naar dashboard
                </Link>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-cevace-blue mb-2">
                            Nieuwe Sollicitatie
                        </h1>
                        <p className="text-gray-600">
                            Voeg je sollicitatie toe en onze AI analyseert automatisch de bedrijfscultuur
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <Building2 size={16} className="inline mr-2" />
                                Bedrijfsnaam *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-blue focus:outline-none"
                                placeholder="Bijv. Google, KLM, ING Bank"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Onze AI zoekt automatisch informatie over de bedrijfscultuur
                            </p>
                        </div>

                        {/* Job Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <Briefcase size={16} className="inline mr-2" />
                                Functietitel *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-blue focus:outline-none"
                                placeholder="Bijv. Senior Frontend Developer, Marketing Manager"
                            />
                        </div>

                        {/* Vacancy Text (Optional) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <FileText size={16} className="inline mr-2" />
                                Vacaturetekst (optioneel)
                            </label>
                            <textarea
                                value={formData.vacancy_text}
                                onChange={(e) => setFormData({ ...formData, vacancy_text: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-blue focus:outline-none resize-none"
                                placeholder="Plak hier de volledige vacaturetekst..."
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Helpt de AI om specifiekere interviewvragen te stellen
                            </p>
                        </div>

                        {/* CV Snapshot (Optional) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <FileText size={16} className="inline mr-2" />
                                Jouw CV (optioneel)
                            </label>
                            <textarea
                                value={formData.cv_snapshot}
                                onChange={(e) => setFormData({ ...formData, cv_snapshot: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-blue focus:outline-none resize-none"
                                placeholder="Plak hier je CV tekst of samenvatting..."
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Helpt de AI om vragen af te stemmen op jouw achtergrond
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/coach"
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
                            >
                                Annuleren
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-cevace-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Aanmaken...
                                    </>
                                ) : (
                                    'Aanmaken en Analyseren'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
