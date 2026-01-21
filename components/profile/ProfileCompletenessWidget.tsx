'use client';

import { useEffect, useState } from 'react';
import { checkProfileCompleteness, type ProfileCompleteness } from '@/actions/profile-completeness';
import { CheckCircle2, AlertCircle, Upload, Link as LinkIcon, User, FileText, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

type ProfileCompletenessWidgetProps = {
    showActions?: boolean; // Show "Voltooien" button
    compact?: boolean; // Compact version for smaller spaces
};

export function ProfileCompletenessWidget({
    showActions = true,
    compact = false
}: ProfileCompletenessWidgetProps) {
    const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const result = await checkProfileCompleteness();
            setCompleteness(result);
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="animate-pulse bg-gray-100 rounded-lg h-32 w-full" />
        );
    }

    if (!completeness) return null;

    const requiredMissing = completeness.missingFields.filter(f => f.priority === 'required');
    const recommendedMissing = completeness.missingFields.filter(f => f.priority === 'recommended');

    // Icon mapping
    const getIcon = (field: string) => {
        switch (field) {
            case 'linkedin_url': return <LinkIcon size={16} />;
            case 'profile_photo_url': return <Upload size={16} />;
            case 'name': return <User size={16} />;
            case 'summary': return <FileText size={16} />;
            case 'experience': return <Briefcase size={16} />;
            case 'education': return <GraduationCap size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    if (compact) {
        return (
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Profiel Volledigheid</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-cv-orange h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completeness.completionPercentage}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-cv-orange">
                            {completeness.completionPercentage}%
                        </span>
                    </div>
                </div>
                {requiredMissing.length > 0 && (
                    <p className="text-xs text-red-600 mt-2">
                        {requiredMissing.length} verplichte {requiredMissing.length === 1 ? 'veld' : 'velden'} ontbreken
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Profiel Volledigheid</h3>
                <span className="text-2xl font-bold text-cv-orange">
                    {completeness.completionPercentage}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                    className="bg-gradient-to-r from-cv-orange to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${completeness.completionPercentage}%` }}
                />
            </div>

            {/* Complete State */}
            {completeness.isComplete && completeness.missingFields.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-green-900">Profiel is compleet! ✨</p>
                        <p className="text-xs text-green-700 mt-0.5">
                            Je bent klaar om een professioneel CV te maken
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Required Fields */}
                    {requiredMissing.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} />
                                Verplicht voor CV generatie
                            </h4>
                            <div className="space-y-2">
                                {requiredMissing.map((field) => (
                                    <div
                                        key={field.field}
                                        className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
                                    >
                                        <span className="text-red-600 mt-0.5">{getIcon(field.field)}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{field.label}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Dit veld is verplicht om je CV te kunnen maken
                                            </p>
                                        </div>
                                        <Link
                                            href="/dashboard/profile"
                                            className="text-xs text-cv-orange hover:underline font-medium whitespace-nowrap"
                                        >
                                            Toevoegen →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended Fields */}
                    {recommendedMissing.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} />
                                Aanbevolen voor beste resultaat
                            </h4>
                            <div className="space-y-2">
                                {recommendedMissing.map((field) => (
                                    <div
                                        key={field.field}
                                        className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                                    >
                                        <span className="text-yellow-600 mt-0.5">{getIcon(field.field)}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{field.label}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Verbetert de kwaliteit van je CV
                                            </p>
                                        </div>
                                        <Link
                                            href="/dashboard/profile"
                                            className="text-xs text-cv-orange hover:underline font-medium whitespace-nowrap"
                                        >
                                            Toevoegen →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {showActions && requiredMissing.length > 0 && (
                        <Link
                            href="/dashboard/profile"
                            className="mt-6 w-full bg-cv-orange hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold text-center block transition-colors"
                        >
                            Profiel Voltooien
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
