import { CheckCircle, AlertCircle, Trophy, RefreshCw, StickyNote } from 'lucide-react';

interface FeedbackItem {
    type: string;
    text: string;
}

interface AnalysisResultProps {
    score: number;
    feedback: FeedbackItem[];
    onReset: () => void;
}

export default function AnalysisResult({ score, feedback, onReset }: AnalysisResultProps) {
    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-green-600 border-green-600';
        if (s >= 75) return 'text-cevace-orange border-cevace-orange';
        return 'text-red-500 border-red-500';
    };

    // Get dynamic color for progress circle based on score
    const getProgressColor = (s: number) => {
        if (s >= 80) return '#10b981'; // Green
        if (s >= 60) return '#f59e0b'; // Amber/Orange
        if (s >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    // Calculate circle circumference for SVG animation
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                {/* Left Column: Score & Vibe */}
                <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm" style={{ paddingTop: '24px', paddingBottom: '54px', paddingLeft: '24px', paddingRight: '24px' }}>
                    <div className="relative mb-8" style={{ width: '230px', height: '230px' }}>
                        {/* Radial Progress Bar - 20% larger */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="115"
                                cy="115"
                                r={radius * 1.2}
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="115"
                                cy="115"
                                r={radius * 1.2}
                                stroke={getProgressColor(score)}
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={circumference * 1.2}
                                strokeDashoffset={strokeDashoffset * 1.2}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-bold text-gray-900" style={{ fontSize: '40px' }}>{score}%</span>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Match</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                        {score >= 85 ? 'Geweldige Match! 🚀' : 'Goed begin, maar er is ruimte voor verbetering.'}
                    </h3>
                    <p className="text-gray-600 text-center max-w-sm mb-8">
                        Op basis van onze analyse sluit jouw profiel voor {score}% aan op deze vacature.
                    </p>

                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
                    >
                        <RefreshCw size={18} />
                        <span>Nieuwe Scan</span>
                    </button>
                </div>

                {/* Right Column: Recruiter Memo (Post-it Style) */}
                <div className="relative flex items-center justify-center">
                    <div className="bg-[#FEF3C7] rounded-sm shadow-lg hover:rotate-0 transition-transform duration-300 h-full flex flex-col relative overflow-hidden" style={{ padding: '26px', borderTop: '6px solid #FDE68A', transform: 'rotate(1deg) scale(0.8)', transformOrigin: 'center' }}>
                        {/* Tape effect */}
                        <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-white/30 backdrop-blur-sm rotate-[-2deg] shadow-sm border border-white/20"></div>

                        <div className="flex items-center gap-2.5 mb-5 text-amber-800/70 border-b border-amber-800/10 pb-3">
                            <StickyNote size={20} />
                            <span className="font-handwriting font-bold uppercase tracking-widest" style={{ fontSize: '18px' }}>Recruiter Memo</span>
                        </div>

                        <div className="mb-4 flex-1" style={{ fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.6', color: '#000000' }}>
                            {feedback.filter(f => f.type === 'info').map((item, index) => (
                                <p key={index} className="mb-3">
                                    {item.text.replace(/^Recruiter Memo:\s*/i, '')}
                                </p>
                            ))}
                        </div>

                        <div className="space-y-2.5">
                            <h4 className="font-bold mb-1.5" style={{ fontSize: '20px', color: '#000000' }}>Verbeterpunten:</h4>
                            {feedback.filter(f => f.type === 'improvement').map((item, index) => (
                                <div key={index} className="flex items-start gap-2" style={{ color: '#000000' }}>
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-black rounded-full flex-shrink-0"></span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
