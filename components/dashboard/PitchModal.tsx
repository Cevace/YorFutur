'use client';

import { useState } from 'react';
import { X, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { generatePitch } from '@/actions/job-search';

interface PitchModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    companyName: string;
}

export default function PitchModal({ isOpen, onClose, jobTitle, companyName }: PitchModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pitch, setPitch] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        const result = await generatePitch(jobTitle, companyName);
        setIsGenerating(false);

        if (result.success && result.data) {
            setPitch(result.data.pitchText);
        }
    };

    const handleCopy = () => {
        if (pitch) {
            navigator.clipboard.writeText(pitch);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setPitch(null);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Smart Pitch Generator</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {jobTitle} @ {companyName}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!pitch && (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-6">
                                Genereer een gepersonaliseerde pitch voor deze vacature.
                            </p>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="bg-cevace-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {isGenerating && <Loader2 size={20} className="animate-spin" />}
                                {isGenerating ? 'Genereren...' : 'Genereer Pitch'}
                            </button>
                        </div>
                    )}

                    {pitch && (
                        <div className="space-y-4">
                            {/* Pitch Text */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                    {pitch}
                                </p>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle size={20} className="text-green-600" />
                                        Gekopieerd!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={20} />
                                        Kopieer naar Clipboard
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
