'use client';

import { useState } from 'react';
import { FileText, Loader2, Download, Save, Edit2, CheckCircle, AlertCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import HarvardTemplate from '@/components/pdf/HarvardTemplate';
import { saveTailoredResume } from '@/actions/resume';

export default function ResumeScanner() {
    const [vacancyTitle, setVacancyTitle] = useState('');
    const [vacancyText, setVacancyText] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewrittenResume, setRewrittenResume] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRewrite = async () => {
        if (!vacancyTitle.trim() || !vacancyText.trim()) {
            setError('Vul zowel de vacaturetitel als de vacaturetekst in.');
            return;
        }

        setIsRewriting(true);
        setError(null);

        try {
            const response = await fetch('/api/rewrite-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vacancyTitle, vacancyText })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Er ging iets mis bij het herschrijven');
            }

            setRewrittenResume(result.data);
            setSuccess('CV succesvol herschreven! Controleer de gegevens en download je PDF.');
        } catch (err: any) {
            console.error('Rewrite error:', err);
            setError(err.message || 'Er ging iets mis bij het herschrijven van je CV');
        } finally {
            setIsRewriting(false);
        }
    };

    const generateFilename = () => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        const titleSlug = vacancyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
        return `${titleSlug}-${dateStr}-${timeStr}.pdf`;
    };

    const handleDownloadPDF = async () => {
        if (!rewrittenResume) return;

        try {
            setIsSaving(true);

            // Generate PDF
            const blob = await pdf(<HarvardTemplate data={rewrittenResume} />).toBlob();
            const filename = generateFilename();

            // Upload to Supabase storage via API route (to avoid Server Action serialization issues)
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('filename', filename);

            const uploadResponse = await fetch('/api/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadResult.success) {
                throw new Error(uploadResult.error || 'PDF upload failed');
            }

            // Save metadata to database
            const saveResult = await saveTailoredResume({
                vacancy_title: vacancyTitle,
                vacancy_text: vacancyText,
                rewritten_content: rewrittenResume,
                pdf_filename: filename,
                pdf_url: uploadResult.url
            });

            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Failed to save resume');
            }

            // Download PDF for user
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);

            setSuccess(`CV opgeslagen en gedownload als ${filename}`);
        } catch (err: any) {
            console.error('Download error:', err);
            setError(err.message || 'Er ging iets mis bij het downloaden van de PDF');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setRewrittenResume(null);
        setVacancyTitle('');
        setVacancyText('');
        setError(null);
        setSuccess(null);
    };

    if (rewrittenResume) {
        return (
            <div className="space-y-6">
                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Preview Header */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Herschreven CV</h2>
                            <p className="text-gray-600">Voor: <strong>{vacancyTitle}</strong></p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Nieuwe Vacature
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-cevace-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Opslaan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    {rewrittenResume.summary && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-bold text-gray-900 mb-2">Professionele Samenvatting</h3>
                            <p className="text-gray-700">{rewrittenResume.summary}</p>
                        </div>
                    )}
                </div>

                {/* Experiences */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Werkervaring</h3>
                    <div className="space-y-6">
                        {rewrittenResume.experiences?.map((exp: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-cevace-blue pl-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {exp.job_title}
                                            {exp.job_title.includes('[AI-SUGGESTIE:') && (
                                                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                                    AI Suggestie
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-cevace-blue font-medium">{exp.company}</p>
                                        {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {exp.start_date} - {exp.is_current ? 'Heden' : exp.end_date}
                                    </p>
                                </div>
                                {exp.description && (
                                    <p className="text-gray-700 text-sm mb-2">
                                        {exp.description}
                                        {exp.description.includes('[DATA NODIG]') && (
                                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                                Data Nodig
                                            </span>
                                        )}
                                    </p>
                                )}
                                {exp.skills && exp.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {exp.skills.map((skill: string, skillIdx: number) => (
                                            <span
                                                key={skillIdx}
                                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                {rewrittenResume.educations && rewrittenResume.educations.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Opleidingen</h3>
                        <div className="space-y-4">
                            {rewrittenResume.educations.map((edu: any, idx: number) => (
                                <div key={idx} className="border-l-4 border-cevace-orange pl-4">
                                    <h4 className="font-bold text-gray-900">
                                        {edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                                    </h4>
                                    <p className="text-cevace-orange font-medium">{edu.school}</p>
                                    <p className="text-sm text-gray-500">
                                        {edu.start_date} - {edu.end_date}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Form */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-cevace-blue/10 rounded-xl flex items-center justify-center">
                        <FileText className="text-cevace-blue" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI CV Herschrijver</h2>
                        <p className="text-gray-600">Pas je CV automatisch aan voor elke vacature</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Vacature Titel *
                        </label>
                        <input
                            type="text"
                            value={vacancyTitle}
                            onChange={(e) => setVacancyTitle(e.target.value)}
                            placeholder="Bijv: Senior Software Engineer bij Google"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Vacature Tekst *
                        </label>
                        <textarea
                            rows={12}
                            value={vacancyText}
                            onChange={(e) => setVacancyText(e.target.value)}
                            placeholder="Plak hier de volledige vacaturetekst..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue resize-none"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {vacancyText.length > 0 ? `${vacancyText.length} tekens` : 'Tip: Kopieer de hele vacaturetekst inclusief eisen en wensen'}
                        </p>
                    </div>

                    <button
                        onClick={handleRewrite}
                        disabled={isRewriting || !vacancyTitle.trim() || !vacancyText.trim()}
                        className="w-full bg-cevace-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRewriting ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>CV wordt herschreven...</span>
                            </>
                        ) : (
                            <>
                                <FileText size={24} />
                                <span>Analyseer & Herschrijf CV</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">Hoe werkt het?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Je master profiel wordt opgehaald uit de database</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>AI herschrijft je CV specifiek voor deze vacature</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>FACT-LOCK:</strong> Datums, bedrijven en scholen blijven exact hetzelfde</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Download als professionele Harvard-style PDF</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
