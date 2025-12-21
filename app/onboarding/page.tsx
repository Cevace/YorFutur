'use client';

import React, { useState } from 'react';
import { CheckCircle, Linkedin, Upload, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PLANS = [
    { id: 'm', t: 'Flexibel', p: '€19,95/mnd', f: ['Onbeperkt Assessments', 'Maandelijks opzegbaar'], pop: false },
    { id: 'y', t: 'Career Pro', p: '€9,95/mnd', sub: '€119/jr', pop: true, f: ['Alles in Flexibel', 'Priority Support', 'LinkedIn Sync'] }
];

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('y');

    const handleNext = () => {
        if (step < 3) {
            setStep(s => s + 1);
        } else {
            setLoading(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-[#F2E9E4]">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/3 bg-[#22223B] text-white p-12 flex-col justify-between">
                <div>
                    <div className="font-bold text-2xl mb-8">CEVACE</div>
                    <h1 className="text-4xl font-bold mb-4 leading-tight">Start je carrière transformatie.</h1>
                    <p className="text-[#9A8C98] text-lg">Binnen 5 minuten klaar om te solliciteren op elite-niveau.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
                    <div className="flex gap-1 text-[#d97706] mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-sm italic text-[#C9ADA7]">&ldquo;Binnen 2 dagen een baan bij Deloitte. De assessment trainer was key.&rdquo;</p>
                    <p className="text-xs text-white/60 mt-2">— Sarah J., Consultant</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-lg w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-[#C9ADA7]/20">
                    {loading ? (
                        <div className="text-center py-16">
                            <Loader2 className="animate-spin mx-auto text-[#d97706] mb-6" size={48} />
                            <h2 className="text-2xl font-bold text-[#22223B] mb-2">Profiel bouwen...</h2>
                            <p className="text-[#4A4E69]">Even geduld, we maken alles klaar.</p>
                        </div>
                    ) : (
                        <>
                            {/* Progress Steps */}
                            <div className="flex justify-between mb-10 px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-[#22223B] text-white' : 'bg-slate-200 text-slate-400'}`}>1</div>
                                <div className={`h-0.5 flex-1 mx-2 mt-4 ${step >= 2 ? 'bg-[#22223B]' : 'bg-slate-200'}`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-[#22223B] text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
                                <div className={`h-0.5 flex-1 mx-2 mt-4 ${step >= 3 ? 'bg-[#22223B]' : 'bg-slate-200'}`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-[#22223B] text-white' : 'bg-slate-200 text-slate-400'}`}>3</div>
                            </div>

                            {/* Step 1: Plan Selection */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-[#22223B] mb-2">Kies je plan</h2>
                                    <p className="text-[#4A4E69] mb-6">Start met 7 dagen gratis. Altijd opzegbaar.</p>
                                    {PLANS.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedPlan(p.id)}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === p.id ? 'border-[#d97706] bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-[#22223B]">{p.t}</h3>
                                                    {p.pop && <span className="text-[8px] bg-[#d97706] text-white px-2 py-0.5 rounded-full font-bold uppercase">Populair</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-[#d97706] text-lg">{p.p}</span>
                                                    {p.sub && <div className="text-xs text-slate-400">{p.sub}</div>}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {p.f.map(f => (
                                                    <div key={f} className="text-sm text-slate-600 flex items-center gap-2">
                                                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                                                        {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Personal Details */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-[#22223B] mb-2">Jouw Gegevens</h2>
                                    <p className="text-[#4A4E69] mb-6">Vul je basisgegevens in om te starten.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            placeholder="Voornaam"
                                            className="p-4 rounded-xl border border-slate-200 w-full focus:border-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 transition-all"
                                        />
                                        <input
                                            placeholder="Achternaam"
                                            className="p-4 rounded-xl border border-slate-200 w-full focus:border-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 transition-all"
                                        />
                                    </div>
                                    <input
                                        placeholder="Email"
                                        type="email"
                                        className="p-4 rounded-xl border border-slate-200 w-full focus:border-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 transition-all"
                                    />
                                    <input
                                        placeholder="Telefoonnummer (optioneel)"
                                        type="tel"
                                        className="p-4 rounded-xl border border-slate-200 w-full focus:border-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 transition-all"
                                    />
                                </div>
                            )}

                            {/* Step 3: Profile Import */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-[#22223B] mb-2">Importeer Profiel</h2>
                                    <p className="text-[#4A4E69] mb-6">Kies hoe je je profiel wilt importeren.</p>
                                    <button className="w-full p-6 rounded-2xl border-2 border-blue-500 bg-blue-50 flex items-center gap-4 text-left hover:bg-blue-100 transition-colors group">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Linkedin className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#22223B]">Via LinkedIn URL</div>
                                            <div className="text-sm text-slate-500">Snelste optie - klaar in 30 sec</div>
                                        </div>
                                    </button>
                                    <button className="w-full p-6 rounded-2xl border-2 border-[#d97706] bg-orange-50 flex items-center gap-4 text-left hover:bg-orange-100 transition-colors group">
                                        <div className="w-12 h-12 bg-[#d97706] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#22223B]">Upload CV (PDF)</div>
                                            <div className="text-sm text-slate-500">We halen alle data eruit</div>
                                        </div>
                                    </button>
                                    <button className="w-full p-4 rounded-xl border border-slate-200 text-center text-slate-500 hover:text-[#22223B] hover:border-slate-300 transition-colors">
                                        Sla over, ik vul later handmatig in
                                    </button>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="mt-10 flex justify-between items-center">
                                {step > 1 ? (
                                    <button
                                        onClick={() => setStep(s => s - 1)}
                                        className="text-slate-400 font-bold hover:text-[#22223B] transition-colors"
                                    >
                                        ← Terug
                                    </button>
                                ) : <div />}
                                <button
                                    onClick={handleNext}
                                    className="bg-[#d97706] text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5"
                                >
                                    {step === 3 ? 'Start Gratis Trial' : 'Volgende'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
