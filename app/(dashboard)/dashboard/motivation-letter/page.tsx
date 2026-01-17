'use client';

import { useState, useEffect, useReducer } from 'react';
import LetterGenerator from '@/components/motivation-letter/LetterGenerator';
import LoadingAnalysis from '@/components/motivation-letter/LoadingAnalysis';
import VariantCard from '@/components/motivation-letter/VariantCard';
import LetterEditor from '@/components/motivation-letter/LetterEditor';
import { MotivationLetterErrorBoundary } from '@/components/motivation-letter/ErrorBoundary';
import { createClient } from '@/utils/supabase/client';
import { Toaster, toast } from 'react-hot-toast';
import { motivationLetterReducer, initialState } from '@/lib/motivation-letter/reducer';
import { LOADING_DELAY_MS, API_ROUTE_TIMEOUT_MS } from '@/lib/motivation-letter/constants';

export default function MotivationLetterPage() {
    const [state, dispatch] = useReducer(motivationLetterReducer, initialState);
    const [userId, setUserId] = useState<string | undefined>();

    // Fetch user ID and profile data on mount
    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Fetch profile data for letter generation
                const [experiencesResult, educationsResult, profileResult] = await Promise.all([
                    supabase.from('profile_experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
                    supabase.from('profile_educations').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
                    supabase.from('profiles').select('first_name, last_name, city, linkedin_url, summary').eq('id', user.id).single()
                ]);

                const profileData = {
                    full_name: profileResult.data
                        ? `${profileResult.data.first_name || ''} ${profileResult.data.last_name || ''}`.trim()
                        : '',
                    city: profileResult.data?.city || '',
                    linkedin_url: profileResult.data?.linkedin_url || '',
                    summary: profileResult.data?.summary || '',
                    experiences: experiencesResult.data || [],
                    education: educationsResult.data || [],
                    skills: []
                };

                dispatch({ type: 'SET_PROFILE_DATA', profileData });
            }
        };
        fetchUserAndProfile();
    }, []);

    const handleGenerate = async (vacancyText: string, profileData: any) => {
        dispatch({ type: 'START_GENERATION' });
        dispatch({ type: 'SHOW_LOADING' });

        try {
            // Call new API route instead of Server Action
            const response = await fetch('/api/motivation-letter/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vacancy_text: vacancyText,
                    candidate_profile: profileData,
                }),
            });

            // Parse JSON response
            const result = await response.json();

            // Check HTTP status code
            if (!response.ok) {
                // Handle specific HTTP error codes
                if (response.status === 408) {
                    // Request Timeout
                    throw new Error('timeout');
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else {
                    throw new Error(result.error || 'Request failed');
                }
            }

            // Safely check if result exists and is valid
            if (result && result.success && result.data && result.letter_id) {
                // Keep loading screen visible for full animation
                setTimeout(() => {
                    dispatch({
                        type: 'GENERATION_SUCCESS',
                        response: result.data,
                        letterId: result.letter_id
                    });
                    toast.success('Motivatiebrieven succesvol gegenereerd!');
                }, LOADING_DELAY_MS);
            } else {
                dispatch({ type: 'GENERATION_ERROR' });
                toast.error(result?.error || 'Generatie mislukt. Probeer het opnieuw.');
            }
        } catch (error) {
            dispatch({ type: 'GENERATION_ERROR' });
            console.error('[handleGenerate] Error:', error);

            // Check if it's a timeout error
            if (error instanceof Error && error.message.includes('timeout')) {
                toast.error(
                    'De AI generatie duurt te lang. Probeer het opnieuw met een kortere vacaturetekst.',
                    { duration: 6000 }
                );
            } else if (error instanceof Error && error.message.includes('Unauthorized')) {
                toast.error('Je bent niet ingelogd. Login opnieuw.');
            } else if (error instanceof TypeError && error.message.includes('fetch')) {
                // Network error
                toast.error(
                    'Netwerkfout. Controleer je internetverbinding en probeer het opnieuw.',
                    { duration: 6000 }
                );
            } else {
                toast.error('Er ging iets mis. Probeer het opnieuw.');
            }
        }
    };

    const handleReset = () => {
        // Confirmation dialog to prevent accidental data loss
        if (state.phase !== 'input') {
            const confirmed = window.confirm(
                'Weet je zeker dat je opnieuw wilt beginnen? Huidige voortgang gaat verloren.'
            );
            if (!confirmed) return;
        }

        dispatch({ type: 'RESET' });
        toast.success('Gereset naar begin');
    };

    const handleVariantSelect = (variantId: 'strategic' | 'culture' | 'storyteller') => {
        dispatch({ type: 'SELECT_VARIANT', variantId });
    };

    const handleBackToSelection = () => {
        dispatch({ type: 'BACK_TO_SELECTION' });
    };

    return (
        <MotivationLetterErrorBoundary>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#22223B',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        duration: 6000,
                    },
                }}
            />

            <div className="min-h-screen bg-[#F2E9E4]">
                {/* Magical Loading Screen */}
                {state.phase === 'generating' && state.showLoading && (
                    <LoadingAnalysis
                        insights={undefined}
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

                {state.phase === 'input' ? (
                    /* Step 1: Input Form */
                    <LetterGenerator
                        onGenerate={handleGenerate}
                        loading={false}
                        profileData={state.profileData}
                    />
                ) : state.phase === 'generating' ? (
                    /* Generating - show nothing, loading overlay handles it */
                    null
                ) : state.phase === 'selection' ? (
                    /* Step 2: Variant Selection */
                    <div>
                        {/* Back Button */}
                        <button
                            onClick={handleReset}
                            className="mb-6 px-6 py-3 bg-cevace-orange text-white rounded-full hover:bg-orange-600 text-sm font-bold transition-all shadow-md"
                        >
                            ← Nieuwe motivatiebrieven genereren
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
                            {state.response.letters.map((variant, index) => (
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
                    (() => {
                        const selectedLetter = state.response.letters.find(
                            l => l.variant_id === state.selectedVariant
                        );

                        if (!selectedLetter) {
                            return (
                                <div className="text-center py-12">
                                    <p className="text-red-600 mb-4">Variant niet gevonden</p>
                                    <button
                                        onClick={handleBackToSelection}
                                        className="px-6 py-3 bg-cevace-orange text-white rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg"
                                    >
                                        Terug naar selectie
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div>
                                {/* Back Button */}
                                <button
                                    onClick={handleBackToSelection}
                                    className="mb-6 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm font-semibold flex items-center gap-2 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Andere versie kiezen
                                </button>

                                <LetterEditor
                                    variant={selectedLetter}
                                    letterId={state.letterId}
                                    focusPoints={state.response.meta?.key_focus_points}
                                    goldenHook={state.response.analysis?.step2}
                                    userId={userId}
                                />
                            </div>
                        );
                    })()
                )}
            </div>
        </MotivationLetterErrorBoundary>
    );
}
