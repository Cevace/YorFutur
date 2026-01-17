'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, TrendingUp, Heart } from 'lucide-react';
import type { GenerateLetterInput } from '@/lib/motivation-letter/types';
import { MIN_VACANCY_LENGTH } from '@/lib/motivation-letter/constants';
import { toast } from 'react-hot-toast';

interface LetterGeneratorProps {
    onGenerate: (vacancyText: string, profileData: any) => Promise<void>;
    loading: boolean;
    initialVacancyText?: string;
    profileData?: any;
}

export default function LetterGenerator({
    onGenerate,
    loading,
    initialVacancyText = '',
    profileData
}: LetterGeneratorProps) {
    const [vacancyText, setVacancyText] = useState(initialVacancyText);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vacancyText.trim()) {
            toast.error('Plak eerst de vacaturetekst');
            return;
        }

        if (vacancyText.trim().length < MIN_VACANCY_LENGTH) {
            toast.error(`Vacaturetekst moet minimaal ${MIN_VACANCY_LENGTH} karakters bevatten voor goede resultaten`);
            return;
        }

        // If profileData is not provided, we'll need to fetch it
        // For now, using placeholder
        const candidateProfile = profileData || {
            full_name: 'Kandidaat Naam', // Will be fetched from actual profile
            skills: [],
            experiences: [],
            education: [],
        };

        await onGenerate(vacancyText, candidateProfile);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit}>
                    {/* Tip - Above textarea */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Lightbulb className="w-4 h-4 text-cevace-orange" />
                        <span>Tip: Plak de volledige vacaturetekst voor de beste resultaten</span>
                    </div>

                    {/* Vacancy Text Input */}
                    <div className="mb-6">
                        <label htmlFor="vacancy" className="block text-sm font-medium text-gray-700 mb-2">
                            Vacaturetekst
                        </label>
                        <textarea
                            id="vacancy"
                            value={vacancyText}
                            onChange={(e) => setVacancyText(e.target.value)}
                            placeholder="Plak hier de volledige vacaturetekst..."
                            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:border-transparent resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#EDEEF1', borderColor: '#D1D5DB', borderWidth: '1px' }}>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Wat je krijgt:</h3>
                        <ul className="text-sm text-gray-900 space-y-2">
                            <li className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span><strong>De Strateeg</strong> - Zakelijk, resultaatgericht</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <span><strong>De Cultuurmatch</strong> - Warm, enthousiast</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                <span><strong>De Verhalenverteller</strong> - Creatief, memorabel</span>
                            </li>
                        </ul>
                    </div>

                    {/* Generate Button */}
                    <button
                        type="submit"
                        disabled={loading || !vacancyText.trim()}
                        className="w-full bg-cevace-orange text-white py-4 rounded-full font-bold hover:bg-orange-600 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Genereren...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Genereer 3 motivatiebrieven
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
