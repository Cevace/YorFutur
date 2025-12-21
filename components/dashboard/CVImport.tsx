'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Check, X, FileText } from 'lucide-react';
import { uploadCV } from '@/actions/scan';
import { hasProfileData } from '@/actions/profile';
import ProfileOverwriteWarning from './ProfileOverwriteWarning';
import { useEffect } from 'react';

export default function CVImport() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ url: string, name: string, storagePath?: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isParsingProfile, setIsParsingProfile] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [hasExistingData, setHasExistingData] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check if user has profile data on mount
        hasProfileData().then(setHasExistingData);
    }, []);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if user has existing profile data
        if (hasExistingData) {
            // Show warning modal
            setPendingFile(file);
            setShowWarning(true);
        } else {
            // No existing data, proceed directly
            await processFileUpload(file);
        }
    }

    async function processFileUpload(file: File) {
        setIsUploading(true);
        setErrorMessage(null);
        const formData = new FormData();
        formData.append('file', file);

        const res = await uploadCV(formData);
        setIsUploading(false);

        if (res.success) {
            setUploadedFile({ url: res.url!, name: res.fileName!, storagePath: res.storagePath });
            // Automatically start parsing
            handleParseProfile(res.storagePath!);
        } else {
            setErrorMessage(res.error || 'Er ging iets mis bij het uploaden');
        }
    }

    function handleWarningConfirm() {
        setShowWarning(false);
        if (pendingFile) {
            processFileUpload(pendingFile);
            setPendingFile(null);
        }
    }

    function handleWarningCancel() {
        setShowWarning(false);
        setPendingFile(null);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function handleParseProfile(storagePath: string) {
        setIsParsingProfile(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/parse-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storagePath })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Parsing failed');
            }

            // Success! Redirect to profile page
            window.location.href = '/dashboard/profile?toast=success';
        } catch (error: any) {
            console.error('Profile parse error:', error);
            setErrorMessage(error.message || 'Er ging iets mis bij het verwerken van je profiel');
            setIsParsingProfile(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {errorMessage && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div
                className={`flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-xl transition-all cursor-pointer ${uploadedFile
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200 hover:border-cevace-orange/50 bg-gray-50/50'
                    }`}
                onClick={() => !isParsingProfile && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    disabled={isParsingProfile}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Loader2 className="animate-spin text-cevace-orange mb-4" size={48} />
                        <p className="text-gray-600 font-medium">Even geduld, we verwerken je CV...</p>
                    </div>
                ) : isParsingProfile ? (
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Loader2 className="animate-spin text-cevace-blue mb-4" size={48} />
                        <p className="text-gray-900 font-bold text-lg mb-2">Profiel wordt bijgewerkt...</p>
                        <p className="text-gray-600 text-sm">We analyseren je CV en vullen je profiel automatisch in</p>
                    </div>
                ) : uploadedFile ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
                            <Check size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">CV Geüpload!</h3>
                        <p className="text-gray-600 mb-2 font-medium break-all max-w-xs mx-auto">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">Je wordt doorgestuurd naar je profiel...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-cevace-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-cevace-orange shadow-sm">
                            <Upload size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload je CV</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Sleep je CV hierheen of klik om een bestand te selecteren
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span>PDF</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span>Word (.docx)</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="mt-8 bg-cevace-orange text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all transform hover:-translate-y-0.5"
                        >
                            Selecteer Bestand
                        </button>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">Hoe werkt het?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Upload je CV (PDF of Word)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We analyseren automatisch je werkervaring en opleidingen</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Je profiel wordt direct bijgewerkt</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Controleer en bewerk je gegevens op je profielpagina</span>
                    </li>
                </ul>
            </div>

            {/* Warning Modal */}
            <ProfileOverwriteWarning
                isOpen={showWarning}
                onConfirm={handleWarningConfirm}
                onCancel={handleWarningCancel}
            />
        </div>
    );
}
