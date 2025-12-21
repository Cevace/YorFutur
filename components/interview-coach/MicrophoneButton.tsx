'use client';

import { useState, useEffect, useRef } from 'react';

interface MicrophoneButtonProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export function MicrophoneButton({ onTranscript, disabled }: MicrophoneButtonProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef('');
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCleanedUpRef = useRef(false);

    // CRITICAL FIX: Initialize recognition ONCE, not on every isListening change
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        // Create recognition instance ONCE
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'nl-NL';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPart = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += transcriptPart + ' ';
                } else {
                    interimTranscript += transcriptPart;
                }
            }

            setTranscript(finalTranscriptRef.current + interimTranscript);

            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            restartTimeoutRef.current = setTimeout(() => {
                if (isListening && recognitionRef.current && !isCleanedUpRef.current) {
                    try {
                        recognitionRef.current.stop();
                        recognitionRef.current.start();
                    } catch (e) {
                        console.log('Recognition restart failed:', e);
                    }
                }
            }, 1000);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'not-allowed') {
                setError('❌ Microfoon toegang geweigerd. Klik op het slot-icoon in de adresbalk om toegang te geven.');
                setIsListening(false);
            } else if (event.error === 'no-speech') {
                setError('⚠️ Geen spraak gedetecteerd. Probeer opnieuw te spreken.');
                setTimeout(() => setError(null), 3000);
            } else if (event.error === 'audio-capture') {
                setError('❌ Microfoon niet gevonden. Controleer je microfooninstellingen.');
                setIsListening(false);
            } else if (event.error === 'network') {
                setError('❌ Netwerkfout. Controleer je internetverbinding.');
                setIsListening(false);
            } else {
                setError(`❌ Fout: ${event.error}`);
                setIsListening(false);
            }
        };

        recognitionRef.current.onend = () => {
            if (isListening && !isCleanedUpRef.current) {
                try {
                    recognitionRef.current?.start();
                } catch (e) {
                    console.log('Auto-restart failed:', e);
                    setIsListening(false);
                }
            }
        };

        // PROPER CLEANUP on unmount
        return () => {
            isCleanedUpRef.current = true;
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                    recognitionRef.current.onresult = null;
                    recognitionRef.current.onerror = null;
                    recognitionRef.current.onend = null;
                } catch (e) {
                    console.log('Cleanup error:', e);
                }
            }
        };
    }, []); // NO DEPENDENCIES - initialize once!

    const startListening = () => {
        if (!recognitionRef.current || disabled || isCleanedUpRef.current) return;

        finalTranscriptRef.current = '';
        setTranscript('');
        setError(null);
        setIsListening(true);

        try {
            recognitionRef.current.start();
        } catch (e: any) {
            console.error('Failed to start recognition:', e);
            setError(`❌ Kan opname niet starten: ${e.message}`);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;

        setIsListening(false);

        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
        }

        try {
            recognitionRef.current.stop();
        } catch (e) {
            console.error('Failed to stop recognition:', e);
        }

        const finalText = finalTranscriptRef.current.trim();

        // VALIDATION: Minimum length check
        if (finalText && finalText.length >= 3) {
            onTranscript(finalText);
        } else if (finalText) {
            setError('⚠️ Antwoord te kort, probeer opnieuw.');
            setTimeout(() => setError(null), 3000);
        }

        setTimeout(() => {
            setTranscript('');
            finalTranscriptRef.current = '';
        }, 500);
    };

    if (!isSupported) {
        return (
            <div className="text-center">
                <p className="text-sm text-red-600 mb-2">
                    Je browser ondersteunt geen spraakherkenning
                </p>
                <p className="text-xs text-gray-500">
                    Gebruik Chrome, Edge, of Safari voor de beste ervaring
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
                {!isListening ? (
                    <button
                        onClick={startListening}
                        disabled={disabled}
                        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-cevace-orange hover:bg-orange-600 active:scale-95"
                    >
                        🎤
                    </button>
                ) : (
                    <button
                        onClick={stopListening}
                        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl bg-red-500 animate-pulse shadow-lg"
                    >
                        ⏹️
                    </button>
                )}
            </div>

            <p className="text-sm text-gray-600 text-center font-medium">
                {isListening ? (
                    <>
                        <span className="text-red-500">● Opname actief</span> - Klik op stop wanneer je klaar bent
                    </>
                ) : (
                    'Klik om opname te starten'
                )}
            </p>

            {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg px-4 py-3 max-w-2xl w-full">
                    <p className="text-sm text-red-800 font-medium text-center">
                        {error}
                    </p>
                </div>
            )}

            {transcript && (
                <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-2xl w-full max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700">
                        {transcript}
                    </p>
                </div>
            )}
        </div>
    );
}
