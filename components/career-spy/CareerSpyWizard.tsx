'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Link2, Loader2, AlertTriangle,
    CheckCircle, DollarSign, Users, Target, ChevronRight, Wallet, HeartHandshake, MessageSquareQuote
} from 'lucide-react';

// Types
interface CandidateProfile {
    name: string;
    culture_type: string;
    work_pace: string;
    structure_preference: string;
    builder_vs_maintainer: string;
    chaos_tolerance: number;
    autonomy_need: number;
}

interface RedFlag {
    category: string;
    headline: string;
    severity: 'low' | 'medium' | 'high';
    source: string;
}

interface CultureMatch {
    fit_score: number;
    warnings: string[];
    risk_level: 'low' | 'medium' | 'high';
    structure_match: number;
    pace_match: number;
}

interface SalaryData {
    min_salary: number;
    max_salary: number;
    cao_scale: string | null;
    market_position: string;
    confidence: number;
}

interface InterviewQuestion {
    question: string;
    reasoning: string;
    what_to_listen_for: string;
}

interface MissionReport {
    company_name: string;
    job_title: string;
    vacancy_url: string;
    candidate_profile: CandidateProfile;
    culture_match: CultureMatch;
    salary_data: SalaryData;
    red_flags: RedFlag[];
    interview_questions: InterviewQuestion[];
    overall_verdict: 'green' | 'yellow' | 'red';
}

export default function CareerSpyWizard() {
    const [vacancyUrl, setVacancyUrl] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<MissionReport | null>(null);
    const [error, setError] = useState('');
    const [profileCvText, setProfileCvText] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);

    // Fetch CV from profile on mount
    useEffect(() => {
        console.log('Career Spy Loaded v2.1 (Style & Profile Fix)');
        const fetchProfileCv = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) return;

                // Get profile data + experiences + educations
                const [profileResult, experiencesResult, educationsResult] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('first_name, last_name, summary, city, linkedin_url')
                        .eq('id', user.id)
                        .single(),
                    supabase
                        .from('profile_experiences')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('start_date', { ascending: false }),
                    supabase
                        .from('profile_educations')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('start_date', { ascending: false })
                ]);

                const profile = profileResult.data;
                const experiences = experiencesResult.data || [];
                const educations = educationsResult.data || [];

                // Check if profile has meaningful data
                const hasName = profile?.first_name || profile?.last_name;
                const hasSummary = profile?.summary && profile.summary.length > 10;
                const hasExperiences = experiences.length > 0;
                const hasEducations = educations.length > 0;

                // Profile is filled if they have a name and EITHER summary, experiences, or educations
                const profileIsFilled = hasName && (hasSummary || hasExperiences || hasEducations);
                console.log('Profile Debug:', { profileIsFilled, hasName, hasSummary: !!profile?.summary, exp: experiences.length, edu: educations.length });
                setHasProfile(profileIsFilled);

                if (profileIsFilled) {
                    // Build CV text from profile data
                    const cvParts: string[] = [];

                    if (profile) {
                        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                        if (fullName) cvParts.push(`Naam: ${fullName}`);
                        if (profile.city) cvParts.push(`Locatie: ${profile.city}`);
                        if (profile.summary) cvParts.push(`Samenvatting:\n${profile.summary}`);
                    }

                    if (experiences.length > 0) {
                        const expText = experiences.map((exp: any) =>
                            `- ${exp.title || 'Functie'} bij ${exp.company || 'Bedrijf'} (${exp.start_date || ''} - ${exp.end_date || 'heden'}): ${exp.description || ''}`
                        ).join('\n');
                        cvParts.push(`Werkervaring:\n${expText}`);
                    }

                    if (educations.length > 0) {
                        const eduText = educations.map((edu: any) =>
                            `- ${edu.degree || 'Opleiding'} bij ${edu.institution || 'Instituut'} (${edu.start_date || ''} - ${edu.end_date || ''})`
                        ).join('\n');
                        cvParts.push(`Opleiding:\n${eduText}`);
                    }

                    setProfileCvText(cvParts.join('\n\n'));
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfileCv();
    }, []);

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('cvText', profileCvText);
            formData.append('vacancyUrl', vacancyUrl);
            formData.append('companyName', companyName);
            formData.append('jobTitle', jobTitle);

            const response = await fetch('/api/career-spy/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Analyse mislukt');
            }

            const data = await response.json();
            setReport(data.report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Er ging iets mis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Brand colors: Almond Silk #C9ADA7, Lilac Ash #9A8C98, Dusty Grape #4A4E69
    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'green': return 'text-green-700 bg-green-100';
            case 'yellow': return 'text-black bg-white';
            case 'red': return 'text-red-700 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-black bg-[#C9ADA7]/20 border-[#9A8C98]';
            case 'medium': return 'text-black bg-[#C9ADA7]/20 border-[#9A8C98]';
            case 'low': return 'text-black bg-[#C9ADA7]/10 border-[#C9ADA7]';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Format warning text: make labels like "STRUCTUUR CLASH:" semibold, remove emojis
    const formatWarning = (warning: string) => {
        // Remove emojis
        const cleanWarning = warning.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|⚠️|🐢|🔐|🏗️|🌪️/gu, '').trim();

        // Find pattern like "LABEL:" and make it semibold
        const match = cleanWarning.match(/^([A-Z][A-Z\s\.]+:)(.*)/);
        if (match) {
            return (
                <>
                    <span className="font-semibold">{match[1]}</span>{match[2]}
                </>
            );
        }
        return cleanWarning;
    };

    // Loading profile state
    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-cevace-orange animate-spin" />
            </div>
        );
    }

    // Show report if available
    if (report) {
        return (
            <div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-bold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                        Career Spy
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Mission report voor <strong>{report.company_name}</strong>
                    </p>
                </div>

                {/* Verdict Banner */}
                <div className={`inline-block mb-8 px-6 py-3 rounded-full font-semibold ${getVerdictColor(report.overall_verdict)}`}>
                    {report.overall_verdict === 'green' && '🟢 Goede match'}
                    {report.overall_verdict === 'yellow' && '🟡 Voorzichtig optimistisch'}
                    {report.overall_verdict === 'red' && '🔴 Hoog risico'}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Fit Score Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cevace-blue" />
                            Culture fit score
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl font-bold text-cevace-blue">
                                {report.culture_match.fit_score}%
                            </div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cevace-orange rounded-full transition-all duration-500"
                                        style={{ width: `${report.culture_match.fit_score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-black" style={{ fontSize: '16px' }}>
                            Jouw profiel: <strong>{report.candidate_profile.culture_type}</strong> |
                            Tempo: <strong>{report.candidate_profile.work_pace}</strong>
                        </p>
                    </div>

                    {/* Salary Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-600" />
                            Salaris inschatting
                        </h3>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                            €{report.salary_data.min_salary.toLocaleString()} - €{report.salary_data.max_salary.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500"> /maand</span>
                        </div>
                        {report.salary_data.cao_scale && (
                            <p className="text-sm text-gray-600">
                                CAO: {report.salary_data.cao_scale}
                            </p>
                        )}
                        <p className="text-black mt-1" style={{ fontSize: '16px' }}>
                            Betrouwbaarheid: {report.salary_data.confidence}%
                        </p>
                    </div>
                </div>

                {/* Warnings */}
                {report.culture_match.warnings.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Waarschuwingen
                        </h3>
                        <div className="space-y-3">
                            {report.culture_match.warnings.map((warning, i) => (
                                <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(201, 173, 167, 0.3)' }}>
                                    <div className="text-black">{formatWarning(warning)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Red Flags */}
                {report.red_flags.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Rode vlaggen
                        </h3>
                        <div className="space-y-3">
                            {report.red_flags.map((flag, i) => (
                                <div key={i} className={`p-4 rounded-xl ${getSeverityColor(flag.severity)}`}>
                                    <div className="font-medium">{flag.headline}</div>
                                    <div className="text-sm opacity-80">{flag.source}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interview Questions */}
                <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        Jouw sollicitatievragen
                    </h3>
                    <div className="space-y-4">
                        {report.interview_questions.map((q, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                                <p className="font-medium text-gray-900 mb-2">
                                    {i + 1}. "{q.question}"
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Let op:</span> {q.what_to_listen_for}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Analysis Button */}
                <button
                    onClick={() => {
                        setReport(null);
                        setVacancyUrl('');
                        setCompanyName('');
                        setJobTitle('');
                    }}
                    className="px-6 py-3 bg-cevace-orange text-white font-semibold rounded-full hover:bg-orange-600 transition-colors"
                >
                    Nieuwe analyse
                </button>
            </div>
        );
    }

    // Analysis in progress
    if (isAnalyzing) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="font-bold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                        Career Spy
                    </h1>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 border-4 border-gray-200 border-t-cevace-orange rounded-full animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Bezig met onderzoek...
                    </h2>
                    <div className="space-y-2 text-gray-600">
                        <p className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Profieldata ophalen
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Cultuurtype bepalen
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 text-cevace-orange animate-spin" />
                            Match analyseren...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Input form (main view)
    return (
        <div>
            {/* Header - matches other dashboard pages */}
            <div className="mb-8">
                <h1 className="font-bold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                    Career Spy
                </h1>
                <p className="text-gray-600 text-lg">
                    Analyseer een vacature en ontdek <strong>verborgen risico's</strong> voordat je solliciteert
                </p>
            </div>

            {/* Info Cards - Above form */}
            {/* Info Cards - Above form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201, 173, 167, 0.2)' }}>
                    <h4 className="font-semibold mb-2 text-black">Salaris intel</h4>
                    <p className="text-sm text-black">Geschatte salarisrange van deze vacature op basis van CAO en geverifieerde marktdata</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201, 173, 167, 0.2)' }}>
                    <h4 className="font-semibold mb-2 text-black">Culture fit</h4>
                    <p className="text-sm text-black">Match score tussen jouw profiel en de bedrijfscultuur</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(201, 173, 167, 0.2)' }}>
                    <h4 className="font-semibold mb-2 text-black">Vragen sollicitatiegesprek</h4>
                    <p className="text-sm text-black">Op maat gemaakte kritische vragen die jij moet stellen tijdens jouw sollicitatiegesprek om de bedrijfscultuur te achterhalen.</p>
                </div>
            </div>

            {/* Warning if no profile */}
            {!hasProfile && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-yellow-800 font-medium">Je profiel is nog niet ingevuld</p>
                        <p className="text-yellow-700 text-sm">
                            Vul eerst je profiel in op de <a href="/dashboard/profile" className="underline font-medium">Profiel pagina</a> voor een nauwkeurige analyse.
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Input Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vacature URL *
                        </label>
                        <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={vacancyUrl}
                                onChange={(e) => setVacancyUrl(e.target.value)}
                                placeholder="https://werkenbij.bedrijf.nl/vacature/..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bedrijfsnaam
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Bijv. Rabobank"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Functietitel
                            </label>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="Bijv. Product Manager"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                            />
                        </div>
                    </div>

                    <button
                        onClick={startAnalysis}
                        disabled={!vacancyUrl.trim() || !hasProfile}
                        className="w-full py-2 bg-cevace-orange text-white font-semibold rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ fontSize: '16px' }}
                    >
                        Start bedrijfsanalyse
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
