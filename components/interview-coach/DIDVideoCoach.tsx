'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Module-level singleton for SDK connection
let globalAgentManager: any = null;
let globalVideoStream: MediaStream | null = null;
let initializationPromise: Promise<void> | null = null;

interface DIDVideoCoachProps {
    agentId: string;
    clientKey: string;
    onReady?: () => void;
    onError?: (error: Error) => void;
}

export interface DIDVideoCoachHandle {
    speak: (audioUrl: string) => void;
    speakText: (text: string) => void;
}

/**
 * D-ID Video Coach Component using Agents SDK
 * Singleton pattern for SDK connection to handle React Strict Mode
 */
const DIDVideoCoach = forwardRef<DIDVideoCoachHandle, DIDVideoCoachProps>(
    ({ agentId, clientKey, onReady, onError }, ref) => {
        const [isConnecting, setIsConnecting] = useState(true);
        const [isReady, setIsReady] = useState(false);
        const [isStreaming, setIsStreaming] = useState(false);
        const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
        const [error, setError] = useState<string | null>(null);
        const videoRef = useRef<HTMLVideoElement>(null);
        const onReadyRef = useRef(onReady);
        const onErrorRef = useRef(onError);

        // Keep refs updated
        useEffect(() => {
            onReadyRef.current = onReady;
            onErrorRef.current = onError;
        }, [onReady, onError]);

        // Speak with audio URL - with error handling
        const speakWithAudio = useCallback(async (audioUrl: string) => {
            if (!globalAgentManager) {
                console.warn('⚠️ Agent not ready for speak');
                return;
            }

            try {
                console.log('🎤 [D-ID SDK] Speaking with audio:', audioUrl);
                // Unmute video when user sends message (user interaction occurred)
                if (videoRef.current && videoRef.current.muted) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                    console.log('🔊 Video unmuted');
                }
                await globalAgentManager.speak({ type: 'audio', audio_url: audioUrl });
            } catch (err: any) {
                console.error('❌ [D-ID SDK] Speak error:', err);

                // Check if it's a session error
                const isSessionError = err?.message?.includes('session') ||
                    err?.kind === 'SessionError' ||
                    String(err).includes('session');

                if (isSessionError) {
                    console.log('🔄 [D-ID SDK] Session expired, attempting reconnect...');
                    try {
                        // Try reconnect first
                        await globalAgentManager.reconnect();
                        console.log('✅ [D-ID SDK] Reconnected, retrying speak...');
                        await globalAgentManager.speak({ type: 'audio', audio_url: audioUrl });
                    } catch (reconnectErr: any) {
                        console.warn('⚠️ [D-ID SDK] Reconnect failed, will reinitialize on next speak');
                        // Reset globals so next component mount will reinitialize
                        globalAgentManager = null;
                        globalVideoStream = null;
                        initializationPromise = null;
                        // Don't crash - just log and continue
                    }
                }
                // Don't rethrow - prevent page crash
            }
        }, []);

        // Speak with text
        const speakWithText = useCallback((text: string) => {
            if (globalAgentManager) {
                console.log('💬 [D-ID SDK] Speaking text:', text);
                globalAgentManager.speak({ type: 'text', input: text });
            } else {
                console.warn('⚠️ Agent not ready for speak');
            }
        }, []);

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            speak: speakWithAudio,
            speakText: speakWithText,
        }));

        // Initialize SDK once (singleton)
        useEffect(() => {
            let mounted = true;

            const setupVideo = () => {
                if (videoRef.current && globalVideoStream) {
                    videoRef.current.srcObject = globalVideoStream;
                    videoRef.current.play().catch(e => {
                        console.log('⏯️ Autoplay blocked:', e.message);
                    });
                }
            };

            // If already initialized, just setup video
            if (globalAgentManager && globalVideoStream) {
                console.log('✅ [D-ID SDK] Using existing connection');
                setupVideo();
                setIsConnecting(false);
                setIsReady(true);
                onReadyRef.current?.();
                return;
            }

            // If initialization in progress, wait for it
            if (initializationPromise) {
                console.log('⏳ [D-ID SDK] Waiting for initialization...');
                initializationPromise.then(() => {
                    if (mounted && globalAgentManager) {
                        setupVideo();
                        setIsConnecting(false);
                        setIsReady(true);
                        onReadyRef.current?.();
                    }
                }).catch(err => {
                    if (mounted) {
                        setError(err.message);
                        setIsConnecting(false);
                    }
                });
                return;
            }

            // Start new initialization
            initializationPromise = (async () => {
                try {
                    console.log('🎥 [D-ID SDK] Initializing agent...', { agentId });

                    const sdk = await import('@d-id/client-sdk');

                    const callbacks = {
                        onSrcObjectReady: (stream: MediaStream) => {
                            console.log('📺 [D-ID SDK] Video stream ready');
                            globalVideoStream = stream;
                            if (mounted && videoRef.current) {
                                videoRef.current.srcObject = stream;
                                videoRef.current.play().catch(() => { });
                            }
                        },
                        onVideoStateChange: (state: string) => {
                            console.log('🎬 [D-ID SDK] Video state:', state);
                            if (mounted) setIsStreaming(state !== 'STOP');
                        },
                        onConnectionStateChange: (state: string) => {
                            console.log('🔌 [D-ID SDK] Connection:', state);
                            if (mounted) {
                                if (state === 'connected') {
                                    setIsConnecting(false);
                                    setIsReady(true);
                                    setError(null);
                                    onReadyRef.current?.();
                                } else if (state === 'fail' || state === 'closed') {
                                    setError('Connection lost');
                                }
                            }
                        },
                        onNewMessage: (msgs: any[]) => {
                            console.log('💬 [D-ID SDK] Messages:', msgs.length);
                        },
                        onError: (err: Error, errorData?: any) => {
                            console.error('❌ [D-ID SDK] Error:', err, errorData);

                            // Check if it's a session error (these are recoverable)
                            const errorStr = err?.message || String(err);
                            const isSessionError = errorStr.includes('session') ||
                                (errorData as any)?.kind === 'SessionError';

                            if (isSessionError) {
                                console.warn('⚠️ [D-ID SDK] Session error - will attempt reconnect on next speak');
                                // Don't show error in UI for session errors - they're recoverable
                                return;
                            }

                            if (mounted) {
                                setError(err.message);
                                onErrorRef.current?.(err);
                            }
                        },
                    };

                    const agent = await sdk.createAgentManager(agentId, {
                        mode: 'DirectPlayback',
                        auth: { type: 'key', clientKey },
                        callbacks,
                        streamOptions: {
                            compatibilityMode: 'auto',
                            streamWarmup: true,
                        },
                    } as any);

                    globalAgentManager = agent;

                    console.log('🔗 [D-ID SDK] Connecting...');
                    await agent.connect();
                    console.log('✅ [D-ID SDK] Connected!');

                } catch (err: any) {
                    console.error('❌ [D-ID SDK] Init failed:', err);
                    // Reset for retry
                    globalAgentManager = null;
                    initializationPromise = null;
                    if (mounted) {
                        setError(err.message || 'Failed to connect');
                        setIsConnecting(false);
                        onErrorRef.current?.(err);
                    }
                    throw err;
                }
            })();

            return () => {
                mounted = false;
            };
        }, [agentId, clientKey]);

        // Cleanup on page unload
        useEffect(() => {
            const cleanup = () => {
                if (globalAgentManager) {
                    console.log('🧹 [D-ID SDK] Cleaning up...');
                    globalAgentManager.disconnect();
                    globalAgentManager = null;
                    globalVideoStream = null;
                    initializationPromise = null;
                }
            };
            window.addEventListener('beforeunload', cleanup);
            return () => window.removeEventListener('beforeunload', cleanup);
        }, []);

        return (
            <div className="relative w-full max-w-lg mx-auto">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-slate-700">
                    <video
                        ref={videoRef}
                        className="w-full aspect-video rounded-2xl bg-black shadow-2xl"
                        autoPlay
                        playsInline
                        muted={isMuted}
                        onLoadedMetadata={() => console.log('📺 Video loaded')}
                        onPlay={() => console.log('▶️ Video playing')}
                        onError={(e) => console.error('❌ Video error:', e)}
                    />

                    {isConnecting && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-cevace-orange animate-spin mx-auto" />
                                <p className="text-white font-medium">Video coach laden...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
                            <div className="text-center space-y-2 p-6 bg-red-900/80 rounded-xl">
                                <p className="text-white font-bold">Video stream error</p>
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {isReady && !error && (
                        <div className={`absolute top-4 right-4 flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-full ${isStreaming ? 'bg-red-500/90' : 'bg-green-500/90'}`}>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-white text-xs font-bold">
                                {isStreaming ? 'Speaking' : 'Ready'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

DIDVideoCoach.displayName = 'DIDVideoCoach';

export default DIDVideoCoach;
