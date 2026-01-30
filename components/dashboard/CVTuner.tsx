'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Loader2, Download, AlertCircle, CheckCircle, Sparkles, BarChart3, Key, AlertTriangle, Lightbulb, Layout, ChevronDown, PenTool, Link as LinkIcon, ArrowDown, FileCheck } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import HarvardTemplate from '@/components/pdf/HarvardTemplate';
import PowerScoreCard from '@/components/dashboard/PowerScoreCard';
import CVEditor from '@/components/dashboard/CVEditor';
import { saveTailoredResume } from '@/actions/resume';
import { saveTunerSession } from '@/actions/cv-tuner-sessions';

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
    const [tunerSessionId, setTunerSessionId] = useState<string | null>(null);
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(true);

    // URL Parsing state
    const [inputMode, setInputMode] = useState<'manual' | 'url'>('manual');
    const [vacancyUrl, setVacancyUrl] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    // Parse URL to extract vacancy data
    const handleParseURL = async () => {
        if (!vacancyUrl.trim()) {
            setError('Vul een URL in');
            return;
        }

        setIsParsing(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/parse-vacancy-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: vacancyUrl })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'URL parsing mislukt');
            }

            // Auto-fill fields
            setVacancyTitle(result.data.title);
            setVacancyText(result.data.text);
            setInputMode('manual'); // Switch to manual view to show results
            setSuccess(`✅ Vacature succesvol ingeladen: "${result.data.title}"`);
        } catch (err: any) {
            console.error('URL parsing error:', err);
            setError(err.message || 'Kon vacature niet ophalen van URL');
        } finally {
            setIsParsing(false);
        }
    };

    // --- PERSISTENCE LOGIC (Phase 5) ---

    // 1. Load from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('cv_tuner_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.vacancyTitle) setVacancyTitle(parsed.vacancyTitle);
                if (parsed.vacancyText) setVacancyText(parsed.vacancyText);
                if (parsed.analysisResult) setAnalysisResult(parsed.analysisResult);
                if (parsed.optimizedResume) setOptimizedResume(parsed.optimizedResume);
                if (parsed.tunerSessionId) setTunerSessionId(parsed.tunerSessionId);
                console.log('Restored CV Tuner state from localStorage');
            } catch (e) {
                console.error('Failed to parse saved state:', e);
            }
        }
    }, []);

    // 2. Save to localStorage on change
    useEffect(() => {
        // Only save if we have meaningful data
        if (vacancyTitle || vacancyText || analysisResult || optimizedResume) {
            const stateToSave = {
                vacancyTitle,
                vacancyText,
                analysisResult,
                optimizedResume,
                tunerSessionId
            };
            localStorage.setItem('cv_tuner_state', JSON.stringify(stateToSave));
        }
    }, [vacancyTitle, vacancyText, analysisResult, optimizedResume, tunerSessionId]);
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
                experience: Array.isArray(data.experiences)
                    ? data.experiences.map((exp: any) => ({
                        ...exp,
                        job_title: sanitizeValue(exp.job_title),
                        company: sanitizeValue(exp.company),
                        location: sanitizeValue(exp.location),
                        description: sanitizeValue(exp.description),
                        skills: Array.isArray(exp.skills) ? exp.skills.map((s: any) => sanitizeValue(s)) : []
                    }))
                    : [],
                education: Array.isArray(data.educations)
                    ? data.educations.map((edu: any) => ({
                        ...edu,
                        degree: sanitizeValue(edu.degree),
                        field_of_study: sanitizeValue(edu.field_of_study),
                        school: sanitizeValue(edu.school)
                    }))
                    : []
            };

            // Check for empty descriptions (common AI failure mode)
            const hasEmptyDescriptions = sanitizedData.experience.some((exp: any) =>
                !exp.description || (typeof exp.description === 'string' && exp.description.trim().length === 0)
            );

            if (hasEmptyDescriptions) {
                console.warn('Some experiences have empty descriptions');
            }

            setOptimizedResume(sanitizedData);
            setEditedResume(sanitizedData); // Initialize editable state

            // Save session for CV Builder handoff
            const sessionResult = await saveTunerSession({
                vacancyTitle,
                vacancyText,
                initialScore: analysisResult.initial_score,
                optimizedScore: sanitizedData.optimized_score || 0,
                keywordsAdded: sanitizedData.keywords_added || [],
                optimizedCvData: sanitizedData,
                recommendedTemplate: 'modern'
            });

            if (sessionResult.success) {
                setTunerSessionId(sessionResult.sessionId!);
                console.log('[CVTuner] Session saved:', sessionResult.sessionId);
            }

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
        // Clear state
        setVacancyTitle('');
        setVacancyText('');
        setAnalysisResult(null);
        setOptimizedResume(null);
        setIsEditorMode(false);
        setError(null);
        setSuccess(null);
        setTunerSessionId(null);

        // Clear Persistence
        localStorage.removeItem('cv_tuner_state');
        console.log('Cleared CV Tuner state');
    };

    const handleEditCV = () => {
        setIsEditorMode(true);
    };

    const handleBackFromEditor = () => {
        setIsEditorMode(false);
    };

    // Auto-collapse "Hoe werkt het" section on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isHowItWorksOpen && window.scrollY > 50) {
                setIsHowItWorksOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHowItWorksOpen]);

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

            {/* How It Works Section - Collapsible */}
            {!optimizedResume && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <button
                        onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
                        className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="font-bold text-gray-900" style={{ fontSize: '24px' }}>Hoe werkt de CV Tuner?</h2>
                        <ChevronDown
                            size={24}
                            className={`transition-transform duration-200 ${isHowItWorksOpen ? 'rotate-180' : ''}`}
                            style={{ color: '#22223B' }}
                        />
                    </button>

                    {isHowItWorksOpen && (
                        <div className="px-8 pb-8 space-y-6 border-t border-gray-100 pt-6">
                            {/* Fase 1 */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8E8EE' }}>
                                    <BarChart3 size={20} style={{ color: '#22223B' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                                        Stap 1: ATS Analyse <span className="font-normal text-base font-inter text-gray-600">(Applicant Tracking Systeem)</span>
                                    </h3>
                                    <p className="text-gray-600">
                                        We scannen je CV en berekenen een <strong>Cevace Power Score</strong> (0-100) op basis van ATS-compatibiliteit, keywords en structuur.
                                    </p>
                                </div>
                            </div>

                            {/* Fase 2 */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8E8EE' }}>
                                    <Sparkles size={20} style={{ color: '#22223B' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">Stap 2: Cevace Optimalisatie</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• <strong>Cevace Applicant AI</strong> voegt ontbrekende keywords uit de vacature toe</li>
                                        <li>• <strong>FACT-LOCK garantie:</strong> Datums, bedrijven en scholen blijven 100% exact hetzelfde</li>
                                        <li>• Score verbetering van gemiddeld <strong>+15-25 punten</strong></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Fase 3 */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8E8EE' }}>
                                    <Layout size={20} style={{ color: '#22223B' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">Stap 3: Template kiezen & downloaden</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• Automatisch doorgestuurd naar de <strong>Ultimate CV Builder</strong></li>
                                        <li>• Kies uit <strong>4 professionele templates</strong></li>
                                        <li>• Direct downloaden als <strong>PDF</strong> of verder personaliseren</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Success Message */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-green-900">
                                    <strong>Jouw geoptimaliseerde CV-data wordt automatisch overgenomen</strong> - geen handmatig overtypen!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Input Form */}
            {!optimizedResume && (
                <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                    {/* Mode Selector Tabs */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setInputMode('manual')}
                            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-colors flex items-center justify-center gap-3 text-[16px] ${inputMode === 'manual'
                                ? 'bg-cevace-orange text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            disabled={!!analysisResult}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
                                <PenTool size={18} className="text-current" />
                            </div>
                            Handmatig invoeren
                        </button>
                        <button
                            onClick={() => setInputMode('url')}
                            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-colors flex items-center justify-center gap-3 text-[16px] ${inputMode === 'url'
                                ? 'bg-cevace-orange text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            disabled={!!analysisResult}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
                                <LinkIcon size={18} className="text-current" />
                            </div>
                            Via URL
                        </button>
                    </div>

                    {/* URL Input Mode */}
                    {inputMode === 'url' && !analysisResult && (
                        <div className="space-y-6">
                            <p className="text-gray-700 mb-4">
                                Plak de URL van een vacature vanaf een bedrijfswebsite. We scannen de pagina voor jou en halen automatisch de vacaturetitel en -tekst op. Dit werkt met de meeste vacature-websites. De analyse kan 1 minuut duren
                            </p>

                            <div>
                                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: '20px' }}>
                                    Vacature URL
                                </label>
                                <input
                                    type="url"
                                    value={vacancyUrl}
                                    onChange={(e) => setVacancyUrl(e.target.value)}
                                    placeholder="https://www.bedrijf.nl/vacatures/functie-naam"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>

                            <button
                                onClick={handleParseURL}
                                disabled={isParsing || !vacancyUrl.trim()}
                                className="w-full bg-cevace-orange text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[16px]"
                            >
                                {isParsing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>URL wordt gescand...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDown size={20} />
                                        <span>Vacature ophalen</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Manual Input Mode */}
                    {inputMode === 'manual' && (
                        <div className="space-y-6">
                            <p className="text-gray-700 mb-4">
                                Kopieer de hele vacaturetekst inclusief eisen en wensen
                            </p>

                            <div>
                                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: '20px' }}>
                                    Vacature titel *
                                </label>
                                <input
                                    type="text"
                                    value={vacancyTitle}
                                    onChange={(e) => setVacancyTitle(e.target.value)}
                                    placeholder="Bijv: Accountmanager bij Cevace"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                    disabled={!!analysisResult}
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: '20px' }}>
                                    Vacature tekst *
                                </label>
                                <textarea
                                    rows={12}
                                    value={vacancyText}
                                    onChange={(e) => setVacancyText(e.target.value)}
                                    placeholder="Plak hier de volledige vacaturetekst..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue resize-none"
                                    disabled={!!analysisResult}
                                />
                                {vacancyText.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {vacancyText.length} tekens
                                    </p>
                                )}
                            </div>

                            {!analysisResult ? (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !vacancyTitle.trim() || !vacancyText.trim()}
                                    className="w-full bg-cevace-orange text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[16px]"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
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
                                    className="w-full bg-cevace-orange text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[16px]"
                                >
                                    {isOptimizing ? (
                                        <>
                                            <Loader2 className="animate-spin inline mr-2" size={20} />
                                            <span>Cevace optimaliseert je CV...</span>
                                        </>
                                    ) : (
                                        <span>Stap 2 - Optimaliseer mijn CV</span>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Analysis Results */}
            {analysisResult && !optimizedResume && (
                <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                    {/* Huidige ATS Score HEADER removed? User said make titles 20px. 
                        Usually 'Analyse Resultaten' was h3. 
                        User: Maak" "Huidige ATS Score", "Ontbrekende Keywords", "Aanbevelingen" 20 px
                        This suggests the score box TITLE is "Huidige ATS Score".
                    */}

                    <div className="space-y-6">
                        {/* Initial Score */}
                        <div className="bg-gradient-to-br from-cevace-blue to-blue-900 rounded-lg p-6 w-1/2 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white text-[20px]">Huidige ATS Score</span>
                                <span className="text-4xl font-bold text-white">{analysisResult.initial_score}%</span>
                            </div>
                            <p className="text-[16px] text-white/90">
                                Status: {analysisResult.ats_status === 'Good Fit, but Needs Optimization' ? 'Goede match, maar optimalisatie nodig' :
                                    analysisResult.ats_status === 'Excellent Match' ? 'Uitstekende match' :
                                        analysisResult.ats_status === 'Poor Match' ? 'Geen goede match' : analysisResult.ats_status}
                            </p>
                        </div>

                        {/* Missing Keywords */}
                        {analysisResult.missing_keywords.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3 text-[20px]">
                                    Ontbrekende keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.missing_keywords.map((keyword, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
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
                                <h4 className="font-bold text-gray-900 mb-3 text-[20px]">
                                    Zwakke punten
                                </h4>
                                <ul className="space-y-3">
                                    {analysisResult.weak_points.map((point, idx) => {
                                        if (typeof point === 'object' && point !== null && 'action' in point) {
                                            return (
                                                <li key={idx} className="bg-orange-50 border-l-4 border-[#101728] p-3 rounded">
                                                    <div className="font-semibold text-[#101728] mb-1">
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
                                        return (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-[#101728] mt-1">•</span>
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
                                <h4 className="font-bold text-gray-900 mb-3 text-[20px]">
                                    Aanbevelingen
                                </h4>
                                <ul className="space-y-3 mb-6">
                                    {analysisResult.recommendations.map((rec, idx) => {
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
                                        return (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-green-500">•</span>
                                                <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Duplicate Optimize Button */}
                                <button
                                    onClick={handleOptimize}
                                    disabled={isOptimizing}
                                    className="w-full bg-cevace-orange text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[16px]"
                                >
                                    {isOptimizing ? (
                                        <>
                                            <Loader2 className="animate-spin inline mr-2" size={20} />
                                            <span>Cevace optimaliseert je CV...</span>
                                        </>
                                    ) : (
                                        <span>Stap 2 - Optimaliseer mijn CV</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* Optimized Resume with Power Score */}
            {
                optimizedResume && !isEditorMode && (
                    <>
                        {/* Power Score Card */}
                        <PowerScoreCard
                            initialScore={analysisResult?.initial_score || 0}
                            optimizedScore={optimizedResume.optimized_score || 0}
                            keywordsAdded={optimizedResume.keywords_added || []}
                        />

                        {/* Summary Block - MOVED UP */}
                        {optimizedResume.summary && (
                            <div className="bg-white rounded-xl p-6 border border-gray-100 mt-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-3">Jouw aangepaste profiel tekst</h3>
                                <p className="text-gray-700">
                                    {typeof optimizedResume.summary === 'string'
                                        ? optimizedResume.summary
                                        : JSON.stringify(optimizedResume.summary)}
                                </p>
                            </div>
                        )}

                        {/* Preview Message (CV Geoptimaliseerd) - MOVED DOWN */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 mt-6 shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8E8EE' }}>
                                    <Sparkles size={20} style={{ color: '#22223B' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-snug mb-2">
                                        Jouw CV succesvol geoptimaliseerd. Bekijk jouw nieuwe Power Score!
                                    </h3>
                                    <p className="text-gray-600">
                                        Je geoptimaliseerde CV is klaar! Klik op &quot;Stap 3 - Vormgeving van jouw CV&quot; om de vormgeving van je CV te bepalen en tekstuele wijzigingen door te voeren.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Explanation Box (Volgende stap) - MOVED DOWN */}
                        {/* Apply official color scheme (dark blue) */}
                        <div className="bg-gradient-to-br from-cevace-blue to-blue-900 rounded-xl p-6 mt-6">
                            <div className="flex items-start gap-3">
                                {/* Icon removed as requested */}
                                <div>
                                    <h3 className="font-bold text-white mb-2">Volgende stap: Vormgeving</h3>
                                    <p className="text-sm text-gray-200 mb-3">
                                        Je geoptimaliseerde CV-data wordt automatisch geladen in de Ultimate CV Builder.
                                        Daar kun je kiezen uit 4 professionele templates en eventueel verder personaliseren.
                                    </p>
                                    <p className="text-sm text-gray-300 italic">
                                        Tip: Het <strong>Modern Template</strong> werkt het beste voor deze functie vanwege de focus op skills en impact.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - MOVED TO BOTTOM */}
                        <div className="flex flex-row gap-4 mt-8 items-center">
                            {/* 1. Builder Button */}
                            {tunerSessionId && (
                                <Link
                                    href={`/dashboard/ultimate-cv-builder?session=${tunerSessionId}`}
                                    className="flex-1 bg-cevace-orange text-white px-6 py-4 rounded-full font-bold text-center hover:bg-orange-600 transition-colors"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Layout size={20} />
                                        <span>Stap 3 - Vormgeving van jouw CV</span>
                                    </div>
                                </Link>
                            )}

                            {/* 2. Manual Edit (Swapped) */}
                            <button
                                onClick={handleEditCV}
                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-full font-semibold hover:bg-gray-300 transition-colors text-center"
                            >
                                Handmatig Bewerken
                            </button>

                            {/* 3. New Vacancy (Swapped) */}
                            <button
                                onClick={handleReset}
                                className="flex-1 px-6 py-4 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
                            >
                                Nieuwe Vacature
                            </button>
                        </div>
                    </>
                )
            }

            {/* CV Editor Mode */}
            {
                isEditorMode && editedResume && (
                    <CVEditor
                        optimizedResume={editedResume} // Use edited version
                        vacancyTitle={vacancyTitle}
                        vacancyText={vacancyText}
                        recommendations={analysisResult?.recommendations || []}
                        onBack={handleBackFromEditor}
                        onChange={setEditedResume} // Sync changes back to parent
                    />
                )
            }

            {/* Info Box */}

        </div >
    );
}
