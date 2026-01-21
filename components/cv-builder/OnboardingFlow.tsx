'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { ProfileCompletenessWidget } from '@/components/profile/ProfileCompletenessWidget';
import type { ProfileCompleteness } from '@/actions/profile-completeness';

type OnboardingFlowProps = {
    initialCompleteness: ProfileCompleteness;
};

export function OnboardingFlow({ initialCompleteness }: OnboardingFlowProps) {
    const router = useRouter();
    const [step, setStep] = useState<'choice' | 'completeness'>('choice');
    const [hasVacancy, setHasVacancy] = useState<boolean | null>(null);

    const handleChoice = (choice: boolean) => {
        setHasVacancy(choice);

        // Check if profile has required fields
        if (!initialCompleteness.hasRequiredFields) {
            // Show completeness check screen
            setStep('completeness');
        } else {
            // Direct navigate to appropriate tool
            if (choice) {
                router.push('/dashboard/tuner');
            } else {
                router.push('/dashboard/ultimate-cv-builder');
            }
        }
    };

    const handleContinue = () => {
        // After completing profile, navigate to chosen tool
        if (hasVacancy) {
            router.push('/dashboard/tuner');
        } else {
            router.push('/dashboard/ultimate-cv-builder');
        }
    };

    // Step 2: Profile Completeness Gate
    if (step === 'completeness') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-cv-navy mb-4">
                        Laatste stap! 🎯
                    </h1>
                    <p className="text-lg text-gray-600">
                        Vul eerst je profiel aan voor de beste CV kwaliteit
                    </p>
                </div>

                {/* Completeness Widget */}
                <ProfileCompletenessWidget />

                {/* Continue Button (only if complete) */}
                {initialCompleteness.hasRequiredFields && (
                    <button
                        onClick={handleContinue}
                        className="mt-6 w-full bg-cv-orange hover:bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
                    >
                        Ga verder met CV maken
                        <ArrowRight size={20} />
                    </button>
                )}

                {/* Info Message */}
                {!initialCompleteness.hasRequiredFields && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            💡 <strong>LinkedIn URL en profielfoto zijn verplicht</strong> voor alle gebruikers.
                            Dit zorgt voor een professioneler eindresultaat en betere herkenbaarheid.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Step 1: Vacancy Question
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-cv-navy mb-4">
                    Maak je perfecte CV
                </h1>
                <p className="text-xl text-gray-600">
                    Beantwoord één vraag om te beginnen
                </p>
            </div>

            {/* Main Question Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Heb je een specifieke vacature waarvoor je solliciteert?
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Option 1: With Vacancy → CV Tuner */}
                    <button
                        onClick={() => handleChoice(true)}
                        className="group relative bg-gradient-to-br from-cv-orange to-orange-600 text-white p-8 rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ja, ik heb een vacature</h3>
                            <p className="text-white/90 text-sm mb-4">
                                Laat AI je CV optimaliseren voor maximale ATS score
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <CheckCircle2 size={16} />
                                <span>ATS Analyse + Keywords</span>
                            </div>
                        </div>
                    </button>

                    {/* Option 2: General CV → Ultimate CV Builder */}
                    <button
                        onClick={() => handleChoice(false)}
                        className="group relative bg-white border-2 border-cv-purple p-8 rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cv-orange"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-cv-beige rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText size={32} className="text-cv-purple" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Nee, algemeen CV</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Maak een professioneel CV met meerdere templates
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <CheckCircle2 size={16} />
                                <span>4 Templates + Design Editor</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    💡 Tip voor werkzoekenden
                </h4>
                <p className="text-sm text-gray-700">
                    Hoe langer je werkloos bent, hoe belangrijker het wordt om je CV aan te passen voor{' '}
                    <strong>elke specifieke vacature</strong>. Gebruik de vacature-optimalisatie voor maximale
                    kans op een uitnodiging!
                </p>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-cv-orange">4</div>
                    <div className="text-xs text-gray-600">Templates</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-cv-orange">AI</div>
                    <div className="text-xs text-gray-600">Optimalisatie</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-cv-orange">ATS</div>
                    <div className="text-xs text-gray-600">Score Check</div>
                </div>
            </div>
        </div>
    );
}
