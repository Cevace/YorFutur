'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';

// Types
interface AssessmentResultData {
    raw_score: number;
    total_questions: number;
    sten_score: number;
    percentile: number;
    interpretation: string;
    feedback: string[];
    competencies?: {
        accuracy: number;
        speed: number;
        difficulty_handling: number;
    };
}

interface ResultsViewProps {
    result: AssessmentResultData;
    category: string;
    onBack: () => void;
}

// STEN Score Label
const getStenLabel = (sten: number): string => {
    if (sten <= 2) return 'Development need';
    if (sten <= 4) return 'Laag gemiddeld';
    if (sten <= 6) return 'Gemiddeld';
    if (sten <= 8) return 'Hoog gemiddeld';
    return 'Top talent';
};

export default function ResultsView({ result, category, onBack }: ResultsViewProps) {
    // Data for Competency RadarChart - ensure values are numbers
    const accuracy = result.competencies?.accuracy ?? Math.round((result.raw_score / result.total_questions) * 100);
    const speed = result.competencies?.speed ?? 75;
    const difficultyHandling = result.competencies?.difficulty_handling ?? 70;

    const competencyData = [
        { subject: 'Nauwkeurigheid', value: accuracy, fullMark: 100 },
        { subject: 'Snelheid', value: speed, fullMark: 100 },
        { subject: 'Moeilijkheid', value: difficultyHandling, fullMark: 100 },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="font-semibold text-gray-900 mb-2" style={{ fontSize: '45px' }}>
                    {category}
                </h2>
                <h1 className="font-semibold text-gray-600" style={{ fontSize: '28px' }}>
                    Training assessment voltooid
                </h1>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* STEN Score - Matching assessment page style */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Jouw STEN score</h3>

                    {/* Big Score */}
                    <div className="text-center mb-4">
                        <div className="text-6xl font-bold text-cevace-blue">{result.sten_score}</div>
                        <div className="text-sm text-gray-500">van 10</div>
                    </div>

                    {/* Visual Scale - Gradient bar matching assessment page */}
                    <div className="relative mb-4">
                        <div className="h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" />
                        <div
                            className="absolute top-0 w-4 h-4 bg-white border-2 border-cevace-blue rounded-full -mt-0.5 shadow"
                            style={{ left: `${(result.sten_score / 10) * 100}%`, transform: 'translateX(-50%)' }}
                        />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mb-4">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                    </div>

                    {/* Label */}
                    <div className="bg-green-50 text-green-700 rounded-lg px-3 py-2 text-center">
                        <span className="font-semibold">{getStenLabel(result.sten_score)}</span>
                    </div>
                </div>

                {/* Ranking */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Jouw ranking</h3>

                    <div className="text-center py-6">
                        <div className="text-6xl font-bold text-cevace-blue mb-2">
                            {result.percentile}%
                        </div>
                        <p className="text-gray-600">
                            Beter dan {result.percentile}% van de normgroep
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {result.raw_score}/{result.total_questions}
                            </div>
                            <div className="text-xs text-gray-500">Correct</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {Math.round((result.raw_score / result.total_questions) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">Nauwkeurigheid</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Competency Radar - 25% less height */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Competentie analyse</h3>

                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="55%" outerRadius="85%" data={competencyData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#374151', fontSize: 14 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                tickCount={5}
                            />
                            <Radar
                                name="Score"
                                dataKey="value"
                                stroke="#1e3a5f"
                                fill="#1e3a5f"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Competency Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{accuracy}%</div>
                        <div className="text-xs text-gray-500">Nauwkeurigheid</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{speed}%</div>
                        <div className="text-xs text-gray-500">Snelheid</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{difficultyHandling}%</div>
                        <div className="text-xs text-gray-500">Moeilijkheid</div>
                    </div>
                </div>
            </div>

            {/* Cevace Coaching Feedback */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Cevace coaching tips</h3>

                <div className="space-y-4">
                    {result.feedback.map((tip, index) => (
                        <div
                            key={index}
                            className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                            <div className="w-6 h-6 rounded-full bg-cevace-orange/20 text-cevace-orange flex items-center justify-center flex-shrink-0 font-bold" style={{ fontSize: '14px' }}>
                                {index + 1}
                            </div>
                            <p className="text-gray-900 leading-relaxed" style={{ fontSize: '16px' }}>{tip}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Back Button - Orange Pill */}
            <div className="text-center">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-cevace-orange text-white rounded-full font-bold hover:bg-cevace-orange/90 transition-colors shadow-md"
                >
                    <ArrowLeft size={18} />
                    Terug naar Assessment training
                </button>
            </div>
        </div>
    );
}
