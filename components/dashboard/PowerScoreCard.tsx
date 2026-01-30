'use client';

import React from 'react';
import { TrendingUp, Zap, Key, CheckCircle } from 'lucide-react';

type PowerScoreCardProps = {
    initialScore: number;
    optimizedScore: number;
    keywordsAdded: string[];
};

export default function PowerScoreCard({ initialScore, optimizedScore, keywordsAdded }: PowerScoreCardProps) {
    const improvement = optimizedScore - initialScore;
    const improvementPercent = Math.round(improvement);

    return (
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Power score analyse
            </h3>

            {/* Before/After Comparison */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Old Score */}
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <p className="text-[16px] text-gray-500 mb-2 font-medium">Oude score</p>
                    <p className="text-4xl font-bold text-gray-400">{initialScore}%</p>
                </div>

                {/* Arrow/Improvement */}
                <div className="flex flex-col items-center justify-center">
                    <TrendingUp className="text-green-600 mb-2" size={32} />
                    <p className="text-3xl font-bold text-green-600">+{improvementPercent}%</p>
                </div>

                {/* New Score */}
                <div className="bg-gradient-to-br from-cevace-blue to-blue-900 rounded-lg p-6 text-center shadow-lg">
                    <p className="text-[16px] text-blue-100 mb-2 font-medium">Nieuwe score</p>
                    <p className="text-4xl font-bold text-white">{optimizedScore}%</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="font-bold text-[16px]">ATS compatibiliteit</span>
                    <span className="font-bold text-[16px]">{optimizedScore}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
                    {/* Old score (background) */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gray-300 transition-all duration-1000"
                        style={{ width: `${initialScore}%` }}
                    />
                    {/* New score (foreground) */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cevace-blue to-cevace-orange transition-all duration-1000 delay-300"
                        style={{ width: `${optimizedScore}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sollicitatiekracht */}
                <div className="bg-white rounded-lg p-6 text-center shadow-sm flex flex-col items-center justify-center h-full">
                    <p className="text-[16px] text-gray-500 mb-2 font-medium">Sollicitatiekracht</p>
                    <p className="text-xl font-bold text-gray-900">+{improvementPercent}%</p>
                </div>

                {/* Keywords Toegevoegd */}
                <div className="bg-white rounded-lg p-6 text-center shadow-sm flex flex-col items-center justify-center h-full">
                    <p className="text-[16px] text-gray-500 mb-2 font-medium">Keywords toegevoegd</p>
                    <p className="text-xl font-bold text-gray-900">{keywordsAdded.length}</p>
                </div>

                {/* ATS Status */}
                <div className="bg-white rounded-lg p-6 text-center shadow-sm flex flex-col items-center justify-center h-full">
                    <p className="text-[16px] text-gray-500 mb-2 font-medium">ATS status</p>
                    <p className="text-xl font-bold text-cevace-orange">Optimized</p>
                </div>
            </div>

            {/* Keywords Added */}
            {keywordsAdded.length > 0 && (
                <div className="mt-6 bg-white rounded-lg p-4">
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        Toegevoegde keywords:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {keywordsAdded.map((keyword, idx) => (
                            <span
                                key={idx}
                                className="bg-slate-100 text-gray-900 px-3 py-1 rounded-full text-[16px] font-medium"
                            >
                                {typeof keyword === 'string' ? keyword : JSON.stringify(keyword)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
