'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * Enhanced Audio Player with D-ID integration
 * Sends audio to D-ID for lip-sync while also playing locally
 */
export class StreamingAudioPlayer {
    private currentAudio: HTMLAudioElement | null = null;
    private currentBlobUrl: string | null = null;
    private abortController: AbortController | null = null;
    private isPlaying = false;
    private didStreamId: string | null = null;
    private didSessionId: string | null = null;

    /**
     * Set D-ID stream config for video animation
     */
    setDIDStream(streamId: string | null, sessionId: string | null) {
        this.didStreamId = streamId;
        this.didSessionId = sessionId;
    }

    /**
     * Play text using ElevenLabs TTS with streaming
     * Also sends audio to D-ID if stream is configured
     */
    async speak(text: string): Promise<() => void> {
        // Cancel any ongoing playback
        this.stop();

        this.isPlaying = true;
        this.abortController = new AbortController();

        try {
            // Fetch from ElevenLabs
            const response = await fetch('/api/coach/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                signal: this.abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`Failed to generate speech: ${response.status}`);
            }

            const audioBlob = await response.blob();

            // Send to D-ID for lip-sync (if configured)
            if (this.didStreamId && this.didSessionId) {
                this.sendToDID(audioBlob).catch(err => {
                    console.error('Failed to send audio to D-ID:', err);
                    // Don't fail the whole function - local audio still works
                });
            }

            // Play locally
            this.currentBlobUrl = URL.createObjectURL(audioBlob);
            this.currentAudio = new Audio(this.currentBlobUrl);

            // Setup cleanup handlers
            const cleanup = () => {
                this.isPlaying = false;
                if (this.currentBlobUrl) {
                    URL.revokeObjectURL(this.currentBlobUrl);
                    this.currentBlobUrl = null;
                }
                this.currentAudio = null;
            };

            this.currentAudio.onended = cleanup;
            this.currentAudio.onerror = (err) => {
                console.error('Audio playback error:', err);
                cleanup();
            };

            await this.currentAudio.play();

            return () => this.stop();

        } catch (error: any) {
            this.isPlaying = false;

            if (error.name === 'AbortError') {
                console.log('Audio request cancelled');
            } else {
                console.error('ElevenLabs speech failed:', error);
                throw error;
            }

            return () => { };
        }
    }

    /**
     * Send audio blob to D-ID for lip-sync animation
     */
    private async sendToDID(audioBlob: Blob): Promise<void> {
        console.log('📤 [AUDIO→D-ID] Starting pipeline', {
            streamId: this.didStreamId,
            sessionId: this.didSessionId,
            blobSize: audioBlob.size,
            blobType: audioBlob.type
        });

        if (!this.didStreamId || !this.didSessionId) {
            console.warn('⚠️ [AUDIO→D-ID] Stream not configured!', {
                hasStreamId: !!this.didStreamId,
                hasSessionId: !!this.didSessionId
            });
            return;
        }

        try {
            // Convert blob to base64
            console.log('🔄 [AUDIO→D-ID] Converting blob to base64...');
            const base64Audio = await this.blobToBase64(audioBlob);
            console.log('✅ [AUDIO→D-ID] Base64 conversion complete, length:', base64Audio.length);

            console.log('📡 [AUDIO→D-ID] Sending to backend endpoint...');
            const response = await fetch('/api/coach/d-id/send-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    streamId: this.didStreamId,
                    sessionId: this.didSessionId,
                    audioData: base64Audio,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ [AUDIO→D-ID] Backend error:', error);
                throw new Error(error.error || 'Failed to send audio to D-ID');
            }

            console.log('✅ [AUDIO→D-ID] Audio sent successfully for lip-sync');
        } catch (error: any) {
            console.error('❌ [AUDIO→D-ID] Pipeline failed:', {
                message: error.message,
                name: error.name,
                stack: error.stack?.split('\n').slice(0, 3)
            });
            // Don't throw - local audio still works
        }
    }

    /**
     * Convert Blob to base64
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Stop current playback and cleanup
     */
    stop(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }

        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }

        this.isPlaying = false;
    }

    getIsPlaying(): boolean {
        return this.isPlaying;
    }
}

/**
 * React hook for audio player with automatic cleanup
 */
export function useAudioPlayer() {
    const playerRef = useRef<StreamingAudioPlayer | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        playerRef.current = new StreamingAudioPlayer();

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
            if (playerRef.current) {
                playerRef.current.stop();
            }
        };
    }, []);

    const speak = useCallback(async (text: string) => {
        if (!playerRef.current) return;

        if (cleanupRef.current) {
            cleanupRef.current();
        }

        try {
            cleanupRef.current = await playerRef.current.speak(text);
        } catch (err) {
            console.error('Speech playback failed:', err);
            throw err;
        }
    }, []);

    const stop = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        if (playerRef.current) {
            playerRef.current.stop();
        }
    }, []);

    const setDIDStream = useCallback((streamId: string | null, sessionId: string | null) => {
        if (playerRef.current) {
            playerRef.current.setDIDStream(streamId, sessionId);
        }
    }, []);

    return {
        speak,
        stop,
        setDIDStream,
        isPlaying: playerRef.current?.getIsPlaying() || false
    };
}

/**
 * Simple speak function with proper cleanup
 */
export async function speakMessage(text: string): Promise<void> {
    const controller = new AbortController();
    let audioUrl: string | null = null;
    let audio: HTMLAudioElement | null = null;

    try {
        const response = await fetch('/api/coach/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error('Failed to generate speech');
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        audio = new Audio(audioUrl);

        await new Promise<void>((resolve, reject) => {
            if (!audio) return reject(new Error('Audio not initialized'));

            const cleanup = () => {
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                }
            };

            audio.onended = () => {
                cleanup();
                resolve();
            };

            audio.onerror = (err) => {
                cleanup();
                reject(err);
            };

            audio.play().catch(reject);
        });

    } catch (error: any) {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        if (error.name !== 'AbortError') {
            console.error('ElevenLabs speech failed:', error);
            throw error;
        }
    }
}

/**
 * Audio player hook for D-ID SDK integration
 * Generates audio URLs that can be passed to SDK speak method
 */
export function useAudioPlayerWithSDK() {
    const playerRef = useRef<StreamingAudioPlayer | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        playerRef.current = new StreamingAudioPlayer();

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
            if (playerRef.current) {
                playerRef.current.stop();
            }
        };
    }, []);

    /**
     * Generate audio from text and upload to Supabase, returning public URL
     * This URL can be passed to D-ID SDK speak method
     */
    const generateAudioUrl = useCallback(async (text: string): Promise<string | null> => {
        try {
            console.log('🎵 [SDK Audio] Generating audio for D-ID...');

            // Generate audio from ElevenLabs
            const response = await fetch('/api/coach/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate speech: ${response.status}`);
            }

            const audioBlob = await response.blob();
            console.log('✅ [SDK Audio] Generated audio blob:', audioBlob.size, 'bytes');

            // Upload to Supabase for public URL
            const formData = new FormData();
            formData.append('audio', audioBlob, 'speech.mp3');

            const uploadResponse = await fetch('/api/coach/d-id/upload-audio', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload audio');
            }

            const { audioUrl } = await uploadResponse.json();
            console.log('✅ [SDK Audio] Uploaded to Supabase:', audioUrl);

            return audioUrl;
        } catch (error) {
            console.error('❌ [SDK Audio] Error:', error);
            return null;
        }
    }, []);

    /**
     * Play audio locally (standard method)
     */
    const speak = useCallback(async (text: string) => {
        if (!playerRef.current) return;

        if (cleanupRef.current) {
            cleanupRef.current();
        }

        try {
            cleanupRef.current = await playerRef.current.speak(text);
        } catch (err) {
            console.error('Speech playback failed:', err);
            throw err;
        }
    }, []);

    const stop = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        if (playerRef.current) {
            playerRef.current.stop();
        }
    }, []);

    return {
        speak,
        stop,
        generateAudioUrl,
        isPlaying: playerRef.current?.getIsPlaying() || false
    };
}
