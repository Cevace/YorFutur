'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Search, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { uploadCV } from '@/actions/scan';
import AnalysisResult from './AnalysisResult';

export default function ScannerInterface() {
    const [activeTab, setActiveTab] = useState<'upload' | 'match'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ url: string, name: string, storagePath?: string } | null>(null);
    const [vacancyText, setVacancyText] = useState('');
    const [result, setResult] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isParsingProfile, setIsParsingProfile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setErrorMessage(null);
        const formData = new FormData();
        formData.append('file', file);

        const res = await uploadCV(formData);
        setIsUploading(false);

        if (res.success) {
            setUploadedFile({ url: res.url!, name: res.fileName!, storagePath: res.storagePath });
            setActiveTab('match'); // Auto switch to match tab
        } else {
            setErrorMessage(res.error || 'Er ging iets mis bij het uploaden');
        }
    }

    async function handleAnalyze() {
        if (!uploadedFile || !vacancyText) {
            setErrorMessage('Selecteer een CV en vul een vacaturetekst in.');
            return;
        }

        setIsAnalyzing(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storagePath: uploadedFile.storagePath,
                    vacancyText: vacancyText
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Er ging iets mis bij de analyse');
            }

            setResult(data);
        } catch (error: any) {
            console.error('Analysis error:', error);
            setErrorMessage(error.message || 'Er ging iets mis bij de analyse');
        } finally {
            setIsAnalyzing(false);
        }
    }

    async function handleParseProfile() {
        if (!uploadedFile) {
            setErrorMessage('Geen CV geselecteerd.');
            return;
        }

        setIsParsingProfile(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/parse-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storagePath: uploadedFile.storagePath
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Er ging iets mis bij het verwerken van je profiel');
            }

            // Success! Redirect to profile editor with toast
            window.location.href = '/dashboard/profile?toast=success';
        } catch (error: any) {
            console.error('Profile parse error:', error);
            setErrorMessage(error.message || 'Er ging iets mis bij het verwerken van je profiel');
            setIsParsingProfile(false);
        }
    }

    if (result) {
        return <AnalysisResult score={result.score} feedback={result.feedback} onReset={() => { setResult(null); setVacancyText(''); setActiveTab('upload'); }} />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            {/* Mobile Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-4 text-center font-medium transition-colors relative ${activeTab === 'upload'
                        ? 'text-cevace-orange bg-orange-50/30'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activeTab === 'upload' ? 'bg-cevace-orange text-white' : 'bg-gray-100 text-gray-500'}`}>1</div>
                        <span className="hidden sm:inline">Upload CV</span>
                        <span className="sm:hidden">CV</span>
                        {uploadedFile && <Check size={16} className="text-green-500 ml-1" />}
                    </div>
                    {activeTab === 'upload' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cevace-orange" />}
                </button>
                <button
                    onClick={() => setActiveTab('match')}
                    disabled={!uploadedFile}
                    className={`flex-1 py-4 text-center font-medium transition-colors relative ${activeTab === 'match'
                        ? 'text-cevace-orange bg-orange-50/30'
                        : (!uploadedFile ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activeTab === 'match' ? 'bg-cevace-orange text-white' : 'bg-gray-100 text-gray-500'}`}>2</div>
                        <span className="hidden sm:inline">Vacature Match</span>
                        <span className="sm:hidden">Match</span>
                    </div>
                    {activeTab === 'match' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cevace-orange" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-1">
                {errorMessage && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{errorMessage}</span>
                        <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
                            <X size={20} />
                        </button>
                    </div>
                )}
                {activeTab === 'upload' ? (
                    <div className="h-full flex flex-col">
                        <div
                            className={`flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed rounded-xl transition-all cursor-pointer ${uploadedFile
                                ? 'border-green-200 bg-green-50/30'
                                : 'border-gray-200 hover:border-cevace-orange/50 bg-gray-50/50'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={handleFileUpload}
                            />
                            {isUploading ? (
                                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                    <Loader2 className="animate-spin text-cevace-orange mb-4" size={48} />
                                    <p className="text-gray-600 font-medium">Even geduld, we verwerken je CV...</p>
                                </div>
                            ) : uploadedFile ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">CV Geüpload!</h3>
                                    <p className="text-gray-600 mb-6 font-medium break-all max-w-xs mx-auto">{uploadedFile.name}</p>
                                    <div className="flex flex-col gap-3 justify-center max-w-md mx-auto">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleParseProfile(); }}
                                            disabled={isParsingProfile}
                                            className="bg-cevace-blue text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-900 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isParsingProfile ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span>Profiel wordt bijgewerkt...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FileText size={20} />
                                                    <span>Profiel Bijwerken</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveTab('match'); }}
                                            className="bg-cevace-orange text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all transform hover:-translate-y-0.5"
                                        >
                                            Vacature Match
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                            className="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium text-sm"
                                        >
                                            Ander bestand kiezen
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-cevace-blue shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Upload size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        Upload je CV
                                    </h3>
                                    <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
                                        Sleep je bestand hierheen of tik om te bladeren (PDF)
                                    </p>
                                    <button className="bg-cevace-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-sm transition-all">
                                        Bestand kiezen
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-cevace-blue shadow-sm flex-shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Geselecteerd CV</p>
                                    <p className="font-bold text-gray-900 truncate">{uploadedFile?.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Waar solliciteer je op?
                            </label>
                            <textarea
                                rows={8}
                                value={vacancyText}
                                onChange={(e) => setVacancyText(e.target.value)}
                                placeholder="Plak hier de volledige tekst van de vacature..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none text-base shadow-sm resize-none"
                            />
                            <p className="mt-2 text-xs text-gray-500 text-right">
                                {vacancyText.length > 0 ? `${vacancyText.length} tekens` : 'Tip: Kopieer de hele tekst inclusief eisen'}
                            </p>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !vacancyText}
                            className="w-full bg-cevace-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Analyseren...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Analyse</span>
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
