'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MicrophoneButton } from '@/components/interview-coach/MicrophoneButton';
import { useAudioPlayerWithSDK } from '@/lib/interview-coach/audio';
import DIDVideoCoach, { DIDVideoCoachHandle } from '@/components/interview-coach/DIDVideoCoach';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ArrowLeft, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { SessionWithMessages } from '@/lib/interview-coach/types';

interface SimulatorClientProps {
    session: SessionWithMessages;
}

// Environment variables for D-ID Agent
const DID_AGENT_ID = process.env.NEXT_PUBLIC_DID_AGENT_ID || '';
const DID_CLIENT_KEY = process.env.NEXT_PUBLIC_DID_CLIENT_KEY || '';

export function SimulatorClient({ session }: SimulatorClientProps) {
    const router = useRouter();
    const [messages, setMessages] = useState(session.messages || []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(session.current_phase);
    const [isMuted, setIsMuted] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const videoCoachRef = useRef<DIDVideoCoachHandle>(null);

    // Audio player hook - now with SDK speak method
    const { speak: speakAudio, generateAudioUrl } = useAudioPlayerWithSDK();

    // Handle video ready
    const handleVideoReady = () => {
        console.log('✅ Video coach ready - D-ID SDK connected!');
        setIsVideoReady(true);
    };

    // Speak with D-ID SDK - D-ID handles both video AND audio
    const speakWithDID = async (text: string) => {
        if (isMuted) return;

        setIsSpeaking(true);
        try {
            // Generate audio URL from ElevenLabs
            const audioUrl = await generateAudioUrl(text);

            if (audioUrl && videoCoachRef.current) {
                // Send audio to D-ID SDK - it will play audio AND animate lips
                console.log('🎤 Sending audio to D-ID SDK:', audioUrl);
                videoCoachRef.current.speak(audioUrl);

                // Wait for D-ID to finish speaking (estimate based on text length)
                // ~150 words per minute = ~2.5 words per second
                const wordCount = text.split(/\s+/).length;
                const estimatedDuration = Math.max(3000, (wordCount / 2.5) * 1000);
                console.log(`⏱️ Waiting ${estimatedDuration}ms for D-ID to speak`);
                await new Promise(resolve => setTimeout(resolve, estimatedDuration));
            } else {
                // Fallback: if D-ID not available, play audio locally
                console.log('⚠️ D-ID not ready, playing audio locally');
                await speakAudio(text);
            }
        } catch (error) {
            console.error('Speech error:', error);
        } finally {
            setIsSpeaking(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start conversation with intro if no messages
    useEffect(() => {
        if (messages.length === 0 && currentPhase === 'INTRO') {
            startIntro();
        }
    }, []);

    const startIntro = async () => {
        setIsProcessing(true);
        setProcessingStatus('De recruiter is aan het denken...');

        try {
            const response = await fetch('/api/coach/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                    userMessage: '[START_CONVERSATION]'
                })
            });

            const data = await response.json();

            if (data.message) {
                const newMessage = {
                    id: Date.now().toString(),
                    session_id: session.id,
                    role: 'assistant' as const,
                    content: data.message,
                    created_at: new Date().toISOString()
                };

                setMessages([newMessage]);
                setCurrentPhase(data.phase);

                // Speak with D-ID lip-sync
                setProcessingStatus('Audio wordt afgespeeld...');
                await speakWithDID(data.message);
            }
        } catch (error) {
            console.error('Failed to start intro:', error);
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const handleTranscript = async (transcript: string) => {
        if (!transcript.trim() || isProcessing) return;

        // Add user message immediately
        const userMessage = {
            id: Date.now().toString(),
            session_id: session.id,
            role: 'user' as const,
            content: transcript,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setProcessingStatus('De recruiter is aan het denken...');

        try {
            const response = await fetch('/api/coach/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                    userMessage: transcript
                })
            });

            const data = await response.json();

            if (data.message) {
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    session_id: session.id,
                    role: 'assistant' as const,
                    content: data.message,
                    created_at: new Date().toISOString()
                };

                setMessages(prev => [...prev, aiMessage]);
                setCurrentPhase(data.phase);

                // Speak with D-ID lip-sync
                setProcessingStatus('Audio wordt gegenereerd...');
                await speakWithDID(data.message);

                // If completed, redirect after a delay
                if (data.phase === 'COMPLETED') {
                    setTimeout(() => {
                        router.push('/dashboard/coach');
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setProcessingStatus('Error: probeer opnieuw');
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            handleTranscript(manualInput);
            setManualInput('');
        }
    };

    // Check if D-ID Agent is configured
    const isDIDConfigured = DID_AGENT_ID && DID_CLIENT_KEY;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <Link
                        href="/coach"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Dashboard
                    </Link>

                    <div className="text-center flex-1">
                        <h2 className="font-bold text-gray-900">{session.application.company_name}</h2>
                        <p className="text-sm text-gray-600">{session.application.job_title}</p>
                    </div>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full">
                    {/* D-ID Video Coach - SDK Based */}
                    <div className="flex flex-col items-center mb-8 gap-6">
                        {isDIDConfigured ? (
                            <DIDVideoCoach
                                ref={videoCoachRef}
                                agentId={DID_AGENT_ID}
                                clientKey={DID_CLIENT_KEY}
                                onReady={handleVideoReady}
                                onError={(error) => console.error('Video coach error:', error)}
                            />
                        ) : (
                            <div className="w-full max-w-lg aspect-video bg-slate-800 rounded-2xl flex items-center justify-center">
                                <div className="text-center p-6">
                                    <p className="text-white font-bold mb-2">D-ID niet geconfigureerd</p>
                                    <p className="text-slate-400 text-sm">
                                        Voeg NEXT_PUBLIC_DID_AGENT_ID en NEXT_PUBLIC_DID_CLIENT_KEY toe aan .env.local
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Processing Status */}
                        {processingStatus && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 animate-pulse">
                                <p className="text-sm text-blue-700 font-medium">{processingStatus}</p>
                            </div>
                        )}

                        {/* Processing Indicator */}
                        {isProcessing && (
                            <div className="flex items-center gap-2 text-cevace-orange">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-sm font-medium">Denkt na...</span>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <p>Het gesprek begint zo...</p>
                        </div>
                    ) : (
                        <div className="mb-6 space-y-4 max-h-64 overflow-y-auto px-2">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-cevace-orange text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="text-sm">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Input Section */}
                    <div className="space-y-4">
                        {/* Toggle Buttons */}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setShowManualInput(false)}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${!showManualInput
                                    ? 'bg-cevace-orange text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🎤 Spraak
                            </button>
                            <button
                                onClick={() => setShowManualInput(true)}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showManualInput
                                    ? 'bg-cevace-orange text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                ⌨️ Typen
                            </button>
                        </div>

                        {!showManualInput ? (
                            <MicrophoneButton
                                onTranscript={handleTranscript}
                                disabled={isProcessing || currentPhase === 'SUMMARY'}
                            />
                        ) : (
                            <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-md mx-auto">
                                <input
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="Typ je antwoord..."
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cevace-orange focus:border-cevace-orange focus:outline-none text-base"
                                    disabled={isProcessing}
                                />
                                <button
                                    type="submit"
                                    disabled={isProcessing || !manualInput.trim()}
                                    className="px-6 py-3 bg-cevace-orange text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Verstuur
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Phase Indicator */}
            <div className="bg-white border-t border-gray-200 p-2 text-center">
                <span className="text-xs text-gray-500">
                    Fase: {currentPhase}
                </span>
            </div>
        </div>
    );
}
