'use client';

import { useState, useEffect } from 'react';
import { generateMotivationLettersAction } from '@/actions/motivation-letter';
import LetterGenerator from '@/components/motivation-letter/LetterGenerator';
import LoadingAnalysis from '@/components/motivation-letter/LoadingAnalysis';
import VariantCard from '@/components/motivation-letter/VariantCard';
import LetterEditor from '@/components/motivation-letter/LetterEditor';
import type { MotivationLetterResponse } from '@/lib/motivation-letter/types';
import { createClient } from '@/utils/supabase/client';

export default function MotivationLetterPage() {
    const [generating, setGenerating] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [response, setResponse] = useState<MotivationLetterResponse | null>(null);
    const [letterId, setLetterId] = useState<string | undefined>();
    const [selectedVariant, setSelectedVariant] = useState<'strategic' | 'culture' | 'storyteller' | null>(null);
    const [userId, setUserId] = useState<string | undefined>();

    // Fetch user ID on mount
    useEffect(() => {
        const fetchUserId = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUserId();
    }, []);

    const handleGenerate = async (vacancyText: string, profileData: any) => {
        setGenerating(true);
        setShowLoading(true);

        const result = await generateMotivationLettersAction({
            vacancy_text: vacancyText,
            candidate_profile: profileData,
        });

        if (result.success && result.data) {
            // Keep loading screen visible for full animation
            setTimeout(() => {
                setResponse(result.data!);
                setLetterId(result.letter_id);
                setShowLoading(false);
                setGenerating(false);
            }, 500);
        } else {
            alert(result.error || 'Generatie mislukt. Probeer het opnieuw.');
            setShowLoading(false);
            setGenerating(false);
        }
    };

    const handleReset = () => {
        setResponse(null);
        setLetterId(undefined);
        setSelectedVariant(null);
    };

    const handleVariantSelect = (variantId: 'strategic' | 'culture' | 'storyteller') => {
        setSelectedVariant(variantId);
    };

    const handleBackToSelection = () => {
        setSelectedVariant(null);
    };

    return (
        <div>
            {/* Magical Loading Screen */}
            {showLoading && (
                <LoadingAnalysis
                    insights={response?.analysis}
                    onComplete={() => { }}
                />
            )}

            {/* Header - Matching CV Tuner/Import style */}
            <div className="mb-8">
                <h1 className="font-bold text-cevace-blue mb-2" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                    Motivatiebrief generator
                </h1>
                <p className="text-gray-600">
                    Professionele motivatiebrieven in 3 verschillende stijlen
                </p>
            </div>

            {!response ? (
                /* Step 1: Input Form */
                <LetterGenerator
                    onGenerate={handleGenerate}
                    loading={generating}
                />
            ) : selectedVariant === null ? (
                /* Step 2: Variant Selection */
                <div>
                    {/* Back Button */}
                    <button
                        onClick={handleReset}
                        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                        ← Nieuwe Brief Genereren
                    </button>

                    {/* Header for Selection */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Jouw strategische opties
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Gebaseerd op de analyse van jouw profiel en de vacature. Kies de insteek die het beste bij je past.
                        </p>
                    </div>

                    {/* Variant Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {response.letters.map((variant, index) => (
                            <VariantCard
                                key={variant.variant_id}
                                variant={variant}
                                selected={false}
                                onSelect={() => handleVariantSelect(variant.variant_id)}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* Step 3: Editor */
                <div>
                    {/* Back Button */}
                    <button
                        onClick={handleBackToSelection}
                        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Andere versie kiezen
                    </button>

                    <LetterEditor
                        variant={response.letters.find(l => l.variant_id === selectedVariant)!}
                        letterId={letterId}
                        focusPoints={response.meta?.key_focus_points}
                        goldenHook={response.analysis?.step2}
                        userId={userId}
                    />
                </div>
            )}
        </div>
    );
}
