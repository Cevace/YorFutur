import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createDIDStream } from '@/lib/interview-coach/d-id-client';
import { rateLimit, RATE_LIMITS, RateLimitError } from '@/lib/interview-coach/rate-limit';

/**
 * Create D-ID Stream
 * Initiates WebRTC connection for video coach
 */
export async function POST(req: NextRequest) {
    try {
        // 1. AUTH CHECK
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. RATE LIMITING
        try {
            rateLimit(`did-stream:${user.id}`, RATE_LIMITS.CHAT); // Reuse chat limits
        } catch (err) {
            if (err instanceof RateLimitError) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded', retryAfter: err.retryAfter },
                    { status: 429, headers: { 'Retry-After': err.retryAfter.toString() } }
                );
            }
            throw err;
        }

        const apiKey = process.env.DID_API_KEY;
        if (!apiKey) {
            console.error('D-ID API key not configured');
            return NextResponse.json({ error: 'Video service not configured' }, { status: 500 });
        }

        // Use high-quality portrait optimized for D-ID:
        // - Front-facing, clear face
        // - Good lighting, neutral expression
        // - Minimum 200x200 face size
        // - No obstructions
        const sourceUrl = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=512&h=512&fit=crop&crop=face';

        // Create stream with source_url
        const stream = await createDIDStream(apiKey, sourceUrl);

        return NextResponse.json({
            streamId: stream.id,
            sessionId: stream.session_id,
            sdpOffer: stream.offer.sdp,
            iceServers: stream.ice_servers,
        });

    } catch (error: any) {
        console.error('D-ID stream creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create stream' },
            { status: 500 }
        );
    }
}
