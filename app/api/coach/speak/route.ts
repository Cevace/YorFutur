import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, RATE_LIMITS, RateLimitError } from '@/lib/interview-coach/rate-limit';

/**
 * ElevenLabs TTS Streaming API
 * Implements streaming audio for instant playback
 * 
 * PROTECTED: Requires authentication + rate limiting
 */
export async function POST(req: NextRequest) {
    try {
        // 1. AUTH CHECK - Must be authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. RATE LIMITING - Prevent abuse
        try {
            rateLimit(`speak:${user.id}`, RATE_LIMITS.SPEAK);
        } catch (err) {
            if (err instanceof RateLimitError) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded', retryAfter: err.retryAfter },
                    { status: 429, headers: { 'Retry-After': err.retryAfter.toString() } }
                );
            }
            throw err;
        }

        // 3. INPUT VALIDATION
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        // Limit text length to prevent abuse
        if (text.length > 5000) {
            return NextResponse.json(
                { error: 'Text too long (max 5000 characters)' },
                { status: 400 }
            );
        }

        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

        if (!ELEVENLABS_API_KEY) {
            console.error('ElevenLabs API key not configured');
            return NextResponse.json(
                { error: 'TTS service not configured' },
                { status: 500 }
            );
        }

        // Emma - Professional Dutch voice
        const VOICE_ID = 'OlBRrVAItyi00MuGMbna'; // Emma

        // Call ElevenLabs streaming API
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_flash_v2_5', // 🚀 FAST! (was eleven_multilingual_v2)
                    voice_settings: {
                        stability: 0.60, // Lower = more expressive, natural variation
                        similarity_boost: 0.85, // Higher = closer to Marlies' natural voice
                        style: 0.40, // Moderate style for conversational tone
                        use_speaker_boost: true,
                    },
                    optimize_streaming_latency: 4, // Max speed for Flash model
                    language_code: 'nl', // Force Dutch
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        // Stream the audio directly to client
        // This allows instant playback as chunks arrive
        return new Response(response.body, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('TTS error:', error);
        return NextResponse.json(
            { error: error.message || 'Text-to-speech failed' },
            { status: 500 }
        );
    }
}
