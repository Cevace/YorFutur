'use client';

import { useState, useEffect, useTransition } from 'react';
import { Brain, BookOpen, Calculator, Scale, ListOrdered, Link2 } from 'lucide-react';
import AssessmentRunner from '@/components/assessment/AssessmentRunner';
import ResultsView from '@/components/assessment/ResultsView';
import { saveAssessmentScore, getUserAssessmentStats, type UserStats, type AssessmentScoreData } from '@/actions/assessment';

// Types
interface AssessmentResult {
    raw_score: number;
    total_questions: number;
    sten_score: number;
    percentile: number;
    interpretation: string;
    feedback: string[];
    competencies: {
        accuracy: number;
        speed: number;
        difficulty_handling: number;
    };
    duration_seconds?: number;
}

type AssessmentMode = 'drill' | 'exam';
type AssessmentCategory = 'abstract' | 'verbal' | 'numerical' | 'logical' | 'sequences' | 'analogies';

// STEN Score Display - Prominent
function StenScoreCard({ stenScore, percentile }: { stenScore: number; percentile: number }) {
    const hasScore = stenScore > 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1">
            <h3 className="font-semibold text-gray-900 mb-4">Jouw STEN score</h3>

            {hasScore ? (
                <>
                    {/* Big Score */}
                    <div className="text-center mb-4">
                        <div className="text-6xl font-bold text-cevace-blue">{stenScore}</div>
                        <div className="text-sm text-gray-500">van 10</div>
                    </div>

                    {/* Visual Scale */}
                    <div className="relative mb-4">
                        <div className="h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" />
                        <div
                            className="absolute top-0 w-4 h-4 bg-white border-2 border-cevace-blue rounded-full -mt-0.5 shadow"
                            style={{ left: `${(stenScore / 10) * 100}%`, transform: 'translateX(-50%)' }}
                        />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mb-4">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                    </div>

                    {/* Percentile */}
                    <div className="bg-green-50 text-green-700 rounded-lg px-3 py-2 text-center">
                        <span className="font-semibold">Top {100 - percentile}%</span>
                        <span className="text-green-600 text-sm ml-1">van normgroep</span>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="text-5xl mb-3">🎯</div>
                    <p className="text-gray-600 font-medium">Nog geen score</p>
                    <p className="text-sm text-gray-500 mt-1">Voltooi je eerste assessment</p>
                </div>
            )}
        </div>
    );
}

// Progress Stats
function ProgressCard({ completed, total }: { completed: number; total: number }) {
    const readiness = total > 0 ? Math.min(100, Math.round((completed / 50) * 100)) : 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Voortgang</h3>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Assessments voltooid</span>
                        <span className="font-semibold text-gray-900">{completed}/50</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={50} aria-label="Assessments voltooid">
                        <div className="h-full bg-cevace-blue rounded-full" style={{ width: `${Math.min(100, (completed / 50) * 100)}%` }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Gereedheid</span>
                        <span className="font-semibold text-gray-900">{readiness}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={readiness} aria-valuemin={0} aria-valuemax={100} aria-label="Gereedheid percentage">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${readiness}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mode Toggle
function ModeToggle({ mode, onModeChange }: { mode: AssessmentMode; onModeChange: (mode: AssessmentMode) => void }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="font-bold text-gray-900" style={{ fontSize: '28px' }}>Start jouw trainingsmodule</h2>
            <div className="flex bg-gray-100 rounded-full p-1 w-fit whitespace-nowrap">
                <button
                    onClick={() => onModeChange('drill')}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === 'drill'
                        ? 'bg-cevace-blue text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Oefenmodus (5)
                </button>
                <button
                    onClick={() => onModeChange('exam')}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === 'exam'
                        ? 'bg-cevace-orange text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Examensimulatie (15)
                </button>
            </div>
        </div>
    );
}

// Assessment Card - All equal size
function AssessmentCard({
    title,
    description,
    icon: Icon,
    onClick,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group bg-white p-5 rounded-xl border border-gray-200 hover:border-cevace-blue hover:shadow-md transition-all text-left w-full h-full"
        >
            <div className="flex flex-col h-full">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-cevace-blue/10 group-hover:bg-cevace-blue flex items-center justify-center text-cevace-blue group-hover:text-white transition-colors flex-shrink-0">
                        <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 group-hover:text-cevace-blue transition-colors" style={{ fontWeight: 400, lineHeight: 1.1 }}>
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <span
                        className="px-4 py-1.5 bg-cevace-orange text-white rounded-full font-medium hover:bg-cevace-orange/90 transition-colors"
                        style={{ fontSize: '14px' }}
                    >
                        Start je training
                    </span>
                </div>
            </div>
        </button>
    );
}

// Main Assessment Dashboard Page
export default function AssessmentPage() {
    const [view, setView] = useState<'dashboard' | 'assessment' | 'results'>('dashboard');
    const [selectedCategory, setSelectedCategory] = useState<AssessmentCategory>('abstract');
    const [selectedMode, setSelectedMode] = useState<AssessmentMode>('drill');
    const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
    const [resultCategory, setResultCategory] = useState<string>('');
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saveError, setSaveError] = useState<string | null>(null);

    // Load user stats on mount
    useEffect(() => {
        async function loadStats() {
            const stats = await getUserAssessmentStats();
            setUserStats(stats);
        }
        loadStats();
    }, []);

    const assessmentTypes = [
        { id: 'abstract' as const, title: 'Abstract Reasoning', description: "Raven's Matrices & patronen", icon: Brain },
        { id: 'verbal' as const, title: 'Verbal Reasoning', description: 'Tekst analyse & conclusies', icon: BookOpen },
        { id: 'numerical' as const, title: 'Numerical Reasoning', description: 'Data, tabellen & grafieken', icon: Calculator },
        { id: 'logical' as const, title: 'Logical Deduction', description: 'Syllogismen & logica', icon: Scale },
        { id: 'sequences' as const, title: 'Number Sequences', description: 'Getallenreeksen', icon: ListOrdered },
        { id: 'analogies' as const, title: 'Verbal Analogies', description: 'Woordrelaties', icon: Link2 },
    ];

    const handleStartAssessment = (category: AssessmentCategory) => {
        setSelectedCategory(category);
        setView('assessment');
    };

    const handleComplete = async (result: AssessmentResult, category: string) => {
        setAssessmentResult(result);
        setResultCategory(category);
        setView('results');

        // Save score to database
        startTransition(async () => {
            const scoreData: AssessmentScoreData = {
                category: selectedCategory,
                mode: selectedMode,
                raw_score: result.raw_score,
                total_questions: result.total_questions,
                sten_score: result.sten_score,
                percentile: result.percentile,
                accuracy: result.competencies.accuracy,
                speed: result.competencies.speed,
                difficulty_handling: result.competencies.difficulty_handling,
                duration_seconds: result.duration_seconds || 0,
            };

            const saveResult = await saveAssessmentScore(scoreData);

            if (saveResult.success) {
                setSaveError(null);
                // Refresh stats after saving
                const newStats = await getUserAssessmentStats();
                setUserStats(newStats);
            } else {
                setSaveError('Score opslaan mislukt. Probeer later opnieuw.');
                console.error('Failed to save score:', saveResult.error);
            }
        });
    };

    const handleBackToDashboard = () => {
        setView('dashboard');
        setAssessmentResult(null);
        setResultCategory('');
    };

    // Results View
    if (view === 'results' && assessmentResult) {
        return (
            <div className="max-w-6xl mx-auto">
                <ResultsView
                    result={assessmentResult}
                    category={resultCategory}
                    onBack={handleBackToDashboard}
                />
            </div>
        );
    }

    // Assessment Runner View
    if (view === 'assessment') {
        return (
            <div className="max-w-6xl mx-auto">
                <AssessmentRunner
                    type={selectedCategory}
                    mode={selectedMode}
                    onComplete={handleComplete}
                    onExit={handleBackToDashboard}
                />
            </div>
        );
    }

    // Dashboard View - Two Column Layout
    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1
                    className="font-bold text-gray-900 leading-tight"
                    style={{ fontSize: '45px' }}
                >
                    Assessment Trainer
                </h1>
                <p className="text-gray-600 mt-4">
                    <strong>Oefen en scoor hoger</strong>
                </p>
                <p className="text-gray-500 mt-2 max-w-3xl">
                    De meeste sollicitanten falen niet op intelligentie, maar op snelheid en stressbestendigheid.
                    De Cevace Assessment Trainer bereidt je voor op de 'Big 3' (SHL, Korn Ferry, LTP) door
                    real-time unieke vragen te genereren op basis van honderden echte assessments.
                </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* Left Column - Stats (1/3 width) - Aligned to bottom */}
                <div className="lg:col-span-1 flex flex-col justify-end gap-6">
                    <StenScoreCard
                        stenScore={userStats?.avg_sten_score || 0}
                        percentile={userStats?.avg_percentile || 50}
                    />
                    <ProgressCard
                        completed={userStats?.total_completed || 0}
                        total={50}
                    />
                </div>

                {/* Right Column - Assessments (2/3 width) */}
                <div className="lg:col-span-2">
                    {/* Mode Toggle */}
                    <ModeToggle mode={selectedMode} onModeChange={setSelectedMode} />

                    {/* Assessment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assessmentTypes.map(item => (
                            <AssessmentCard
                                key={item.id}
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                onClick={() => handleStartAssessment(item.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
