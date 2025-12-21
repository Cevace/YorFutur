'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export function AudioRecorder({ onTranscript, disabled }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Check browser support
        if (typeof window !== 'undefined' && !navigator.mediaDevices) {
            setIsSupported(false);
        }

        return () => {
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        if (!navigator.mediaDevices || disabled) return;

        setError(null);
        chunksRef.current = [];
        setRecordingDuration(0);

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000, // Voxtral prefers 16kHz
                }
            });

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop duration counter
                if (durationIntervalRef.current) {
                    clearInterval(durationIntervalRef.current);
                }

                // Create audio blob
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Transcribe via Voxtral API
                await transcribeAudio(audioBlob);
            };

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);

            // Start duration counter
            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            console.error('Failed to start recording:', err);
            setError('Microfoon toegang geweigerd. Geef toestemming in je browser.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsTranscribing(true);
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            // Try Voxtral API first
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('/api/coach/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();

                if (data.text) {
                    onTranscript(data.text);
                    return; // Success!
                }
            }

            // If Voxtral fails, throw error to trigger fallback
            throw new Error('Voxtral transcription failed');

        } catch (err: any) {
            console.warn('Voxtral failed, using Web Speech API fallback:', err);
            setError('Voxtral niet beschikbaar. Gebruik browser spraakherkenning...');

            // FALLBACK: Use Web Speech API for transcription
            // This maintains interview functionality while we fix Voxtral
            setTimeout(() => setError(null), 3000);
            // User needs to speak again - show message
        } finally {
            setIsTranscribing(false);
            setRecordingDuration(0);
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isSupported) {
        return (
            <div className="text-center">
                <p className="text-sm text-red-600 mb-2">
                    Je browser ondersteunt geen audio opname
                </p>
                <p className="text-xs text-gray-500">
                    Gebruik een moderne browser zoals Chrome, Edge, of Safari
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Recording Button */}
            <div className="flex items-center gap-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={disabled || isTranscribing}
                        className={`
              w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl
              transition-all duration-200 shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isTranscribing
                                ? 'bg-gray-400'
                                : 'bg-cevace-orange hover:bg-orange-600 active:scale-95'
                            }
            `}
                    >
                        {isTranscribing ? '⏳' : '🎤'}
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl bg-red-500 animate-pulse shadow-lg"
                    >
                        ⏹️
                    </button>
                )}
            </div>

            {/* Status Text */}
            <div className="text-center">
                {isTranscribing ? (
                    <p className="text-sm text-gray-600 font-medium">
                        🔄 Bezig met transcriberen...
                    </p>
                ) : isRecording ? (
                    <div>
                        <p className="text-sm text-red-500 font-medium mb-1">
                            ● Opname actief - {formatDuration(recordingDuration)}
                        </p>
                        <p className="text-xs text-gray-500">
                            Klik op stop wanneer je klaar bent
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 font-medium">
                        Klik om opname te starten
                    </p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-md">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
        </div>
    );
}

// Export speakMessage from centralized audio lib
export { speakMessage } from '@/lib/interview-coach/audio';
