import React, { useState, useEffect } from 'react';
import {
    Printer, Layout, Type, Palette, Save, Download,
    Briefcase, GraduationCap, User, Wrench, Sparkles,
    AlertTriangle, CheckCircle2, ChevronRight, Loader2,
    RefreshCcw, ArrowRight
} from 'lucide-react';

// --- MOCK API LOGICA ---
const SIMULATE_API_DELAY = 1500;

const mockRewriteService = async (text, context) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (context === 'summary') {
                resolve("Gedreven Sales Manager met bewezen expertise in B2B-relatiebeheer en strategische acquisitie. Expert in het vertalen van klantbehoeften naar passende softwareoplossingen, resulterend in een consistente omzetgroei en hoge klanttevredenheid.");
            } else if (context === 'experience') {
                resolve("Verantwoordelijk voor het beheer van de volledige verkoopcyclus voor zakelijke softwarelicenties. Succesvol in het genereren van nieuwe leads via cold calling en netwerkevenementen, wat leidde tot een omzetstijging van 15% in het eerste jaar.");
            } else {
                resolve(text + " (Verbeterd door Cevace AI)");
            }
        }, SIMULATE_API_DELAY);
    });
};

const mockAtsScanService = async (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const issues = [];
            let score = 65;

            if (data.personal.summary.length < 50) {
                issues.push({ type: 'error', text: "Je profieltekst is te kort voor ATS systemen.", field: 'summary' });
                score -= 10;
            }
            if (data.skills.length < 5) {
                issues.push({ type: 'warning', text: "Voeg minimaal 5 relevante vaardigheden toe.", field: 'skills' });
                score -= 5;
            }
            const hasAction = data.experience.some(e => e.description.toLowerCase().includes('verantwoordelijk') || e.description.toLowerCase().includes('succesvol'));
            if (!hasAction) {
                issues.push({ type: 'warning', text: "Gebruik krachtige actiewoorden in je werkervaring (bijv. 'Gerealiseerd', 'Geleid').", field: 'experience' });
                score -= 10;
            }

            resolve({ score, issues });
        }, SIMULATE_API_DELAY);
    });
};

// --- DATA ---
const INITIAL_DATA = {
    personal: {
        fullName: "Thomas de Jager",
        jobTitle: "Sales Manager",
        email: "thomas@cevace.com",
        phone: "06-12345678",
        address: "Rotterdam",
        summary: "Sales manager met ervaring in B2B.",
    },
    experience: [
        {
            id: 1,
            role: "Account Manager",
            company: "Cloud Solutions",
            city: "Utrecht",
            start: "2019",
            end: "Heden",
            description: "Ik verkocht software licenties aan bedrijven en belde klanten."
        }
    ],
    education: [
        {
            id: 1,
            school: "Erasmus Universiteit",
            degree: "Bachelor Bedrijfskunde",
            city: "Rotterdam",
            start: "2015",
            end: "2018",
            description: ""
        }
    ],
    skills: ["Sales", "Microsoft Office", "Rijbewijs B"]
};

// --- COMPONENTS ---
const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-sm font-medium text-blue-600">Cevace AI is bezig...</span>
        </div>
    </div>
);

const ScoreCircle = ({ score, scanning }) => {
    const radius = 30;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            {scanning ? (
                <Loader2 className="animate-spin text-blue-600" size={40} />
            ) : (
                <>
                    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                        <circle stroke="#e5e7eb" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} fill="transparent" />
                        <circle
                            stroke={score > 75 ? "#22c55e" : score > 50 ? "#eab308" : "#ef4444"}
                            strokeWidth={stroke}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                            strokeLinecap="round"
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            fill="transparent"
                        />
                    </svg>
                    <span className="absolute text-sm font-bold text-gray-700">{score}</span>
                </>
            )}
        </div>
    );
};

// --- MAIN APP ---
export default function CevaceUltimate() {
    const [data, setData] = useState(INITIAL_DATA);
    const [activeTab, setActiveTab] = useState('editor');
    const [loadingField, setLoadingField] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [auditResult, setAuditResult] = useState({ score: 0, issues: [] });
    const [hasScanned, setHasScanned] = useState(false);
    const [accentColor, setAccentColor] = useState('#2563eb');

    const handleRewrite = async (field, id = null, currentValue) => {
        const loadingKey = id ? `${field}-${id}` : field;
        setLoadingField(loadingKey);
        try {
            const improvedText = await mockRewriteService(currentValue, field);
            if (id) {
                setData(prev => ({ ...prev, experience: prev.experience.map(item => item.id === id ? { ...item, [field]: improvedText } : item) }));
            } else {
                setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: improvedText } }));
            }
        } catch (error) { console.error(error); } finally { setLoadingField(null); }
    };

    const runFullAudit = async () => {
        setIsScanning(true);
        setActiveTab('audit');
        try {
            const results = await mockAtsScanService(data);
            setAuditResult(results);
            setHasScanned(true);
        } catch (error) { console.error(error); } finally { setIsScanning(false); }
    };

    const renderModernLayout = () => (
        <div className="flex flex-col md:flex-row min-h-[297mm] bg-white shadow-lg print:shadow-none">
            <div className="w-1/3 p-8 text-white print:bg-blue-600" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                <h1 className="text-3xl font-bold leading-tight mb-2">{data.personal.fullName}</h1>
                <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-8">{data.personal.jobTitle}</p>
                <div className="space-y-4 text-sm mb-8 opacity-90">
                    <p>{data.personal.email}</p>
                    <p>{data.personal.phone}</p>
                    <p>{data.personal.address}</p>
                </div>
                <h3 className="font-bold border-b border-white/30 pb-2 mb-4 uppercase text-sm">Vaardigheden</h3>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, i) => (
                        <span key={i} className="bg-white/20 px-2 py-1 rounded text-sm">{skill}</span>
                    ))}
                </div>
            </div>
            <div className="w-2/3 p-8">
                <div className="mb-8">
                    <h3 className="text-xl font-bold uppercase tracking-wider mb-2 text-gray-800" style={{ color: accentColor }}>Profiel</h3>
                    <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
                </div>
                <div className="mb-8">
                    <h3 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-800" style={{ color: accentColor }}>Werkervaring</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-6">
                            <h4 className="text-lg font-bold text-gray-900">{exp.role}</h4>
                            <div className="text-sm text-gray-500 font-semibold mb-2">{exp.company} | {exp.start} - {exp.end}</div>
                            <p className="text-gray-700">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white border-b h-16 px-6 flex items-center justify-between sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-2 py-1 rounded">C</div>
                    <span className="font-bold text-gray-800 text-lg">Cevace<span className="text-blue-600">Ultimate</span></span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'editor' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Type size={16} /> Editor</button>
                    <button onClick={() => setActiveTab('design')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'design' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Palette size={16} /> Design</button>
                    <button onClick={() => setActiveTab('audit')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><CheckCircle2 size={16} /> Smart Audit {hasScanned && <span className={`w-2 h-2 rounded-full ${auditResult.score > 70 ? 'bg-green-500' : 'bg-red-500'}`} />}</button>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={runFullAudit} className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"><RefreshCcw size={16} /> Scan</button>
                    <button onClick={() => window.print()} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Printer size={16} /> PDF</button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-full lg:w-[450px] bg-white border-r flex flex-col h-full overflow-hidden print:hidden">
                    <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                        <div><h2 className="font-bold text-gray-800">CV Score</h2><p className="text-xs text-gray-500">ATS Standaarden</p></div>
                        <div className="flex items-center gap-4"><ScoreCircle score={hasScanned ? auditResult.score : 0} scanning={isScanning} /></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'editor' && (
                            <div className="space-y-8 pb-20">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2"><User size={14} /> Persoonsgegevens</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input value={data.personal.fullName} onChange={e => setData({ ...data, personal: { ...data.personal, fullName: e.target.value } })} placeholder="Naam" className="p-2 border rounded text-sm w-full" />
                                        <input value={data.personal.jobTitle} onChange={e => setData({ ...data, personal: { ...data.personal, jobTitle: e.target.value } })} placeholder="Functie" className="p-2 border rounded text-sm w-full" />
                                    </div>
                                    <div className="relative group">
                                        <textarea className="w-full p-3 border rounded-lg text-sm min-h-[120px]" value={data.personal.summary} onChange={e => setData({ ...data, personal: { ...data.personal, summary: e.target.value } })} placeholder="Profiel..." />
                                        {loadingField === 'summary' && <LoadingOverlay />}
                                        <button onClick={() => handleRewrite('summary', null, data.personal.summary)} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 mt-2 border border-indigo-200"><Sparkles size={12} /> Verbeter</button>
                                    </div>
                                </section>
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2"><Briefcase size={14} /> Werkervaring</h3>
                                    {data.experience.map((exp, idx) => (
                                        <div key={exp.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm relative">
                                            <input value={exp.role} onChange={e => { const newExp = [...data.experience]; newExp[idx].role = e.target.value; setData({ ...data, experience: newExp }); }} className="font-bold text-sm border-none p-0 w-full mb-1" placeholder="Functie" />
                                            <div className="relative mt-2">
                                                <textarea className="w-full p-2 bg-gray-50 border border-gray-100 rounded text-sm min-h-[100px]" value={exp.description} onChange={e => { const newExp = [...data.experience]; newExp[idx].description = e.target.value; setData({ ...data, experience: newExp }); }} />
                                                {loadingField === `description-${exp.id}` && <LoadingOverlay />}
                                            </div>
                                            <button onClick={() => handleRewrite('description', exp.id, exp.description)} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 mt-2 border border-indigo-200"><Sparkles size={12} /> Herschrijf</button>
                                        </div>
                                    ))}
                                </section>
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2"><Wrench size={14} /> Skills</h3>
                                    <textarea className="w-full p-3 border rounded text-sm" value={data.skills.join(", ")} onChange={e => setData({ ...data, skills: e.target.value.split(", ") })} />
                                </section>
                            </div>
                        )}
                        {activeTab === 'audit' && (
                            <div className="space-y-6">
                                {!hasScanned && !isScanning && <div className="text-center py-10"><button onClick={runFullAudit} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Start Analyse</button></div>}
                                {isScanning && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>}
                                {hasScanned && !isScanning && (
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-lg border ${auditResult.score > 70 ? 'bg-green-50' : 'bg-orange-50'}`}><h3 className="font-bold">Score: {auditResult.score}/100</h3></div>
                                        <div>{auditResult.issues.map((issue, idx) => (<div key={idx} className="flex gap-3 p-3 bg-white border rounded-lg mb-2"><AlertTriangle size={16} className="text-yellow-500" /><p className="text-sm">{issue.text}</p></div>))}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                <div><h3 className="font-bold text-gray-700 mb-2">Kleur</h3><div className="flex gap-2">{['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'].map(c => (<button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-full border-2 ${accentColor === c ? 'border-gray-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center print:bg-white print:p-0 print:absolute print:inset-0 print:z-[100]">
                    <style>{`@media print { @page { margin: 0; size: auto; } body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`}</style>
                    <div className="w-[210mm] shadow-2xl print:shadow-none">{renderModernLayout()}</div>
                </div>
            </div>
        </div>
    );
}
