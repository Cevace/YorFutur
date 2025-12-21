'use client';

import { useState } from 'react';
import { FileText, Loader2, Download, AlertCircle, CheckCircle, Sparkles, BarChart3, Key, AlertTriangle, Lightbulb } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import HarvardTemplate from '@/components/pdf/HarvardTemplate';
import PowerScoreCard from '@/components/dashboard/PowerScoreCard';
import CVEditor from '@/components/dashboard/CVEditor';
import { saveTailoredResume } from '@/actions/resume';

type AnalysisResult = {
    initial_score: number;
    missing_keywords: string[];
    weak_points: (string | { action: string; details?: string })[];
    recommendations: (string | { action: string; details?: string })[];
    ats_status: string;
};

export default function CVTuner() {
    const [vacancyTitle, setVacancyTitle] = useState('');
    const [vacancyText, setVacancyText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [optimizedResume, setOptimizedResume] = useState<any | null>(null);
    const [editedResume, setEditedResume] = useState<any | null>(null); // Persist edits here
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Phase 1: Analyze CV
    const handleAnalyze = async () => {
        if (!vacancyTitle.trim() || !vacancyText.trim()) {
            setError('Vul zowel de vacaturetitel als de vacaturetekst in.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);
        setOptimizedResume(null);

        try {
            const response = await fetch('/api/analyze-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vacancyTitle, vacancyText })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Er ging iets mis bij de analyse');
            }

            setAnalysisResult(result.data);
        } catch (err: any) {
            console.error('Analysis error:', err);
            setError(err.message || 'Er ging iets mis bij het analyseren van je CV');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Phase 2: Optimize CV with AI
    const handleOptimize = async () => {
        if (!analysisResult || !vacancyTitle || !vacancyText) {
            setError('Voer eerst een analyse uit');
            return;
        }

        try {
            setIsOptimizing(true);
            setError(null);

            const response = await fetch('/api/rewrite-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vacancyTitle,
                    vacancyText
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const result = await response.json();

            // Validate response structure
            if (!result.data) {
                throw new Error('Invalid response: missing data');
            }

            const data = result.data;

            // Critical validation
            if (!data.personal || !data.experiences || !Array.isArray(data.experiences)) {
                console.error('Invalid AI response:', data);
                throw new Error('AI response ontbreekt persoonlijke informatie of werkervaring. Probeer opnieuw.');
            }

            // **DEEP SANITIZATION** - Clean all data to prevent object rendering errors
            const sanitizeValue = (val: any): any => {
                if (val === null || val === undefined) return '';
                if (typeof val === 'string') return val;
                if (typeof val === 'number' || typeof val === 'boolean') return String(val);
                if (Array.isArray(val)) return val.map(item => sanitizeValue(item));
                if (typeof val === 'object') {
                    console.warn('Sanitizing nested object:', val);
                    return JSON.stringify(val);
                }
                return String(val);
            };

            const sanitizedData = {
                ...data,
                summary: sanitizeValue(data.summary),
                keywords_added: Array.isArray(data.keywords_added)
                    ? data.keywords_added.map((k: any) => sanitizeValue(k))
                    : [],
                experiences: data.experiences.map((exp: any) => ({
                    ...exp,
                    job_title: sanitizeValue(exp.job_title),
                    company: sanitizeValue(exp.company),
                    location: sanitizeValue(exp.location),
                    description: sanitizeValue(exp.description),
                    skills: Array.isArray(exp.skills) ? exp.skills.map((s: any) => sanitizeValue(s)) : []
                })),
                educations: Array.isArray(data.educations)
                    ? data.educations.map((edu: any) => ({
                        ...edu,
                        degree: sanitizeValue(edu.degree),
                        field_of_study: sanitizeValue(edu.field_of_study),
                        school: sanitizeValue(edu.school)
                    }))
                    : []
            };

            // Check for empty descriptions (common AI failure mode)
            const hasEmptyDescriptions = sanitizedData.experiences.some((exp: any) =>
                !exp.description || (typeof exp.description === 'string' && exp.description.trim().length === 0)
            );

            if (hasEmptyDescriptions) {
                console.warn('Some experiences have empty descriptions');
            }

            setOptimizedResume(sanitizedData);
            setEditedResume(sanitizedData); // Initialize editable state
            setSuccess('CV succesvol geoptimaliseerd! Bekijk de Power Score en download je PDF.');
        } catch (err: any) {
            console.error('Optimization error:', err);
            // Don't reset state on error - keep analysis result
            setError(err.message || 'Er ging iets mis bij het optimaliseren van je CV. Probeer het opnieuw.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleReset = () => {
        setVacancyTitle('');
        setVacancyText('');
        setAnalysisResult(null);
        setOptimizedResume(null);
        setIsEditorMode(false);
        setError(null);
        setSuccess(null);
    };

    const handleEditCV = () => {
        setIsEditorMode(true);
    };

    const handleBackFromEditor = () => {
        setIsEditorMode(false);
    };

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

            {/* Input Form */}
            {!optimizedResume && (
                <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
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
                                disabled={!!analysisResult}
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
                                disabled={!!analysisResult}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                {vacancyText.length > 0 ? `${vacancyText.length} tekens` : 'Tip: Kopieer de hele vacaturetekst inclusief eisen en wensen'}
                            </p>
                        </div>

                        {!analysisResult ? (
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !vacancyTitle.trim() || !vacancyText.trim()}
                                className="w-full bg-cevace-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="animate-spin inline mr-2" size={20} />
                                        <span>CV wordt geanalyseerd...</span>
                                    </>
                                ) : (
                                    <span>Analyseer CV</span>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleOptimize}
                                disabled={isOptimizing}
                                className="w-full bg-cevace-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOptimizing ? (
                                    <>
                                        <Loader2 className="animate-spin inline mr-2" size={20} />
                                        <span>Cevace optimaliseert je CV...</span>
                                    </>
                                ) : (
                                    <span>Optimaliseer & Genereer PDF</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {analysisResult && !optimizedResume && (
                <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Analyse Resultaten</h3>

                    <div className="space-y-6">
                        {/* Initial Score */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700">Huidige ATS Score</span>
                                <span className="text-4xl font-bold text-cevace-orange">{analysisResult.initial_score}%</span>
                            </div>
                            <p className="text-sm text-gray-600">Status: {analysisResult.ats_status}</p>
                        </div>

                        {/* Missing Keywords */}
                        {analysisResult.missing_keywords.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3">
                                    Ontbrekende Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.missing_keywords.map((keyword, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200"
                                        >
                                            {typeof keyword === 'string' ? keyword : JSON.stringify(keyword)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weak Points */}
                        {analysisResult.weak_points.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3">
                                    Zwakke Punten
                                </h4>
                                <ul className="space-y-3">
                                    {analysisResult.weak_points.map((point, idx) => {
                                        // Check if point is an object with action/details or similar structure
                                        if (typeof point === 'object' && point !== null && 'action' in point) {
                                            return (
                                                <li key={idx} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                                                    <div className="font-semibold text-orange-900 mb-1">
                                                        {(point as any).action}
                                                    </div>
                                                    {(point as any).details && (
                                                        <div className="text-sm text-gray-700">
                                                            {(point as any).details}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        }
                                        // Fallback to string rendering
                                        return (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-orange-500 mt-1">•</span>
                                                <span>{typeof point === 'string' ? point : JSON.stringify(point)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {analysisResult.recommendations.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3">
                                    Aanbevelingen
                                </h4>
                                <ul className="space-y-3">
                                    {analysisResult.recommendations.map((rec, idx) => {
                                        // Check if rec is an object with action/details
                                        if (typeof rec === 'object' && rec !== null && 'action' in rec) {
                                            return (
                                                <li key={idx} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                                    <div className="font-semibold text-green-900 mb-1">
                                                        {rec.action}
                                                    </div>
                                                    {rec.details && (
                                                        <div className="text-sm text-gray-700">
                                                            {rec.details}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        }
                                        // Fallback to string rendering
                                        return (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-green-500">•</span>
                                                <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Optimized Resume with Power Score */}
            {optimizedResume && !isEditorMode && (
                <>
                    {/* Power Score Card */}
                    <PowerScoreCard
                        initialScore={analysisResult?.initial_score || 0}
                        optimizedScore={optimizedResume.optimized_score || 0}
                        keywordsAdded={optimizedResume.keywords_added || []}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleReset}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Nieuwe Vacature
                        </button>
                        <button
                            onClick={handleEditCV}
                            className="flex-1 bg-cevace-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Bewerk CV →
                        </button>
                    </div>

                    {/* Preview Message */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">✨ CV Geoptimaliseerd!</h3>
                        <p className="text-gray-600">
                            Je geoptimaliseerde CV is klaar! Klik op "Bewerk CV" om AI-suggesties aan te passen voordat je de PDF downloadt.
                        </p>
                        {optimizedResume.summary && (
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3">Professionele Samenvatting</h3>
                                <p className="text-gray-700">
                                    {typeof optimizedResume.summary === 'string'
                                        ? optimizedResume.summary
                                        : JSON.stringify(optimizedResume.summary)}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* CV Editor Mode */}
            {isEditorMode && editedResume && (
                <CVEditor
                    optimizedResume={editedResume} // Use edited version
                    vacancyTitle={vacancyTitle}
                    vacancyText={vacancyText}
                    recommendations={analysisResult?.recommendations || []}
                    onBack={handleBackFromEditor}
                    onChange={setEditedResume} // Sync changes back to parent
                />
            )}

            {/* Info Box */}
            {!analysisResult && !optimizedResume && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Hoe werkt de CV Tuner?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <BarChart3 size={16} className="text-cevace-blue mt-0.5 flex-shrink-0" />
                            <span><strong>Fase 1:</strong> We analyseren je CV en berekenen een ATS score (0-100)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Sparkles size={16} className="text-cevace-orange mt-0.5 flex-shrink-0" />
                            <span><strong>Fase 2:</strong> AI optimaliseert je CV door ontbrekende keywords toe te voegen</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>FACT-LOCK:</strong> Datums, bedrijven en scholen blijven exact hetzelfde</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Download size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Resultaat:</strong> Download als professionele Harvard-style PDF</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
