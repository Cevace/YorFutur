'use client';

import { useState } from 'react';
import { Save, Download, Loader2, ArrowLeft, Trash2, Plus, Check } from 'lucide-react';

type CVEditorProps = {
    optimizedResume: any;
    vacancyTitle: string;
    vacancyText: string;
    recommendations?: any[];
    onBack: () => void;
    onChange?: (resume: any) => void; // New prop for syncing state
};

// Helper to safely convert any value to string
const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        console.warn('Rendering object as string:', value);
        return JSON.stringify(value);
    }
    return String(value);
};

export default function CVEditor({ optimizedResume, vacancyTitle, vacancyText, recommendations = [], onBack, onChange }: CVEditorProps) {
    // Editable state - ensure all values are strings
    const [summary, setSummary] = useState(safeString(optimizedResume.summary || ''));
    const [experiences, setExperiences] = useState(optimizedResume.experiences || []);
    const [educations, setEducations] = useState(optimizedResume.educations || []);

    const [isSaving, setIsSaving] = useState(false);
    const [savedPdfUrl, setSavedPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Sync helper
    const syncChanges = (newSummary: string, newExperiences: any[], newEducations: any[]) => {
        if (onChange) {
            onChange({
                ...optimizedResume,
                summary: newSummary,
                experiences: newExperiences,
                educations: newEducations
            });
        }
    };

    const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newSummary = e.target.value;
        setSummary(newSummary);
        setSuccess(null); // Reset success state on change
        syncChanges(newSummary, experiences, educations);
    };

    const handleExperienceChange = (index: number, field: string, value: any) => {
        const newExperiences = [...experiences];
        newExperiences[index] = {
            ...newExperiences[index],
            [field]: value
        };
        setExperiences(newExperiences);
        setSuccess(null); // Reset success state on change
        syncChanges(summary, newExperiences, educations);
    };

    const handleSkillsChange = (index: number, skillsString: string) => {
        const newExperiences = [...experiences];
        newExperiences[index] = {
            ...newExperiences[index],
            skills: skillsString.split(',').map(s => s.trim()).filter(s => s)
        };
        setExperiences(newExperiences);
        setSuccess(null); // Reset success state on change
        syncChanges(summary, newExperiences, educations);
    };

    const handleEducationChange = (index: number, field: string, value: string) => {
        const newEducations = [...educations];
        newEducations[index] = {
            ...newEducations[index],
            [field]: value
        };
        setEducations(newEducations);
        setSuccess(null); // Reset success state on change
        syncChanges(summary, experiences, newEducations);
    };

    const handleAddExperience = () => {
        const newExperiences = [
            ...experiences,
            {
                job_title: '',
                company: '',
                location: '',
                start_date: '',
                end_date: '',
                description: '',
                skills: []
            }
        ];
        setExperiences(newExperiences);
        setSuccess(null);
        syncChanges(summary, newExperiences, educations);
    };

    const handleRemoveExperience = (index: number) => {
        const newExperiences = experiences.filter((_: any, i: number) => i !== index);
        setExperiences(newExperiences);
        setSuccess(null);
        syncChanges(summary, newExperiences, educations);
    };

    const handleAddEducation = () => {
        const newEducations = [
            ...educations,
            {
                degree: '',
                school: '',
                field_of_study: '',
                start_date: '',
                end_date: ''
            }
        ];
        setEducations(newEducations);
        setSuccess(null);
        syncChanges(summary, experiences, newEducations);
    };

    const handleRemoveEducation = (index: number) => {
        const newEducations = educations.filter((_: any, i: number) => i !== index);
        setEducations(newEducations);
        setSuccess(null);
        syncChanges(summary, experiences, newEducations);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare edited resume
            const editedResume = {
                ...optimizedResume,
                summary,
                experiences,
                educations
            };

            // Generate PDF via API route
            const generateResponse = await fetch('/api/generate-cv-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume: editedResume })
            });

            if (!generateResponse.ok) {
                throw new Error('PDF generatie mislukt');
            }

            const pdfBlob = await generateResponse.blob();

            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `cv-${vacancyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}.pdf`;

            // Upload PDF to Supabase
            const formData = new FormData();
            formData.append('file', pdfBlob, filename);
            formData.append('filename', filename);

            const uploadResponse = await fetch('/api/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadResult.success) {
                throw new Error(uploadResult.error || 'Upload mislukt');
            }

            // Save metadata to database
            const saveModule = await import('@/actions/resume');
            const saveResult = await saveModule.saveTailoredResume({
                vacancy_title: vacancyTitle,
                vacancy_text: vacancyText,
                rewritten_content: editedResume,
                pdf_filename: filename,
                pdf_url: uploadResult.url
            });

            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Database save mislukt');
            }

            setSavedPdfUrl(uploadResult.url);
            setSavedPdfUrl(uploadResult.url);
            setSuccess('true'); // Just a flag now
        } catch (err: any) {
            console.error('Save error:', err);
            setError(err.message || 'Er ging iets mis bij het opslaan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!savedPdfUrl) return;

        try {
            // Fetch the PDF as a blob to force download and hide URL
            const response = await fetch(savedPdfUrl);

            if (!response.ok) {
                throw new Error('Download mislukt');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            // Extract filename from URL or use default
            const filename = savedPdfUrl.split('/').pop() || 'optimized-cv.pdf';
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            setError('Kon PDF niet downloaden. Probeer het opnieuw.');
        }
    };

    const hasRecommendations = recommendations && recommendations.length > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor - Full width if no recommendations, else 2/3 */}
            <div className={`${hasRecommendations ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Bewerk je geoptimaliseerde CV</h2>
                        <p className="text-gray-600 mt-1">Pas Cevace-suggesties aan voordat je de PDF downloadt</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Terug
                    </button>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {/* Success message removed - now handled in button state */}

                {/* Summary */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3">Professionele samenvatting</h3>
                    <textarea
                        value={summary}
                        onChange={handleSummaryChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange resize-none"
                        placeholder="Professionele samenvatting..."
                    />
                </div>

                {/* Experiences */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Werkervaring</h3>
                        <button
                            onClick={handleAddExperience}
                            className="flex items-center gap-1 text-sm text-cevace-orange hover:text-orange-700 font-medium"
                        >
                            <Plus size={16} />
                            Toevoegen
                        </button>
                    </div>
                    <div className="space-y-6">
                        {experiences.map((exp: any, index: number) => (
                            <div key={index} className="relative border-l-4 border-cevace-orange pl-4 space-y-3 group">
                                <button
                                    onClick={() => handleRemoveExperience(index)}
                                    className="absolute -left-[29px] top-0 bg-white border border-gray-200 p-1 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Verwijder ervaring"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Functietitel</label>
                                    <input
                                        type="text"
                                        value={safeString(exp.job_title || '')}
                                        onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf</label>
                                        <input
                                            type="text"
                                            value={safeString(exp.company || '')}
                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
                                        <input
                                            type="text"
                                            value={safeString(exp.location || '')}
                                            onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                                    <textarea
                                        value={safeString(exp.description || '')}
                                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Komma gescheiden)</label>
                                    <input
                                        type="text"
                                        value={(Array.isArray(exp.skills) ? exp.skills : []).join(', ')}
                                        onChange={(e) => handleSkillsChange(index, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                                        placeholder="JavaScript, React, Node.js"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Educations */}
                {educations.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Opleiding</h3>
                            <button
                                onClick={handleAddEducation}
                                className="flex items-center gap-1 text-sm text-cevace-blue hover:text-blue-700 font-medium"
                            >
                                <Plus size={16} />
                                Toevoegen
                            </button>
                        </div>
                        <div className="space-y-4">
                            {educations.map((edu: any, index: number) => (
                                <div key={index} className="relative border-l-4 border-blue-500 pl-4 space-y-3 group">
                                    <button
                                        onClick={() => handleRemoveEducation(index)}
                                        className="absolute -left-[29px] top-0 bg-white border border-gray-200 p-1 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Verwijder opleiding"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Diploma</label>
                                            <input
                                                type="text"
                                                value={safeString(edu.degree || '')}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Richting</label>
                                            <input
                                                type="text"
                                                value={safeString(edu.field_of_study || '')}
                                                onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-200 -mx-6 -mb-6 rounded-b-xl">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-cevace-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Opslaan...</span>
                            </>
                        ) : success ? (
                            <>
                                <Check size={20} />
                                <span>Opgeslagen & Klaar voor download</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Opslaan & Genereer PDF</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!savedPdfUrl}
                        className="flex-1 bg-cevace-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>

            {/* Recommendations Sidebar - 1/3 width on large screens, sticky */}
            {recommendations && recommendations.length > 0 && (
                <div className="lg:col-span-1">
                    <div className="sticky top-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold text-gray-900">AI aanbevelingen</h3>
                        </div>
                        <p className="text-base text-gray-600 mb-4">
                            Pas deze suggesties toe in je CV voor de beste match
                        </p>
                        <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
                            {recommendations.map((rec, idx) => {
                                // Check if rec is an object with action/details
                                if (typeof rec === 'object' && rec !== null && 'action' in rec) {
                                    return (
                                        <div key={idx} className="bg-white border border-green-300 p-3 rounded-lg">
                                            <div className="font-semibold text-green-900 text-sm mb-1">
                                                {(rec as any).action}
                                            </div>
                                            {(rec as any).details && (
                                                <div className="text-xs text-gray-600">
                                                    {(rec as any).details}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                // Fallback to string rendering
                                return (
                                    <div key={idx} className="bg-white border border-green-300 p-3 rounded-lg text-sm text-gray-700">
                                        {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
