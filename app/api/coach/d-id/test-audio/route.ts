import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Test D-ID Stream with Sample Audio
 * GET /api/coach/d-id/test-audio?streamId=xxx&sessionId=xxx
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = process.env.DID_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get('streamId');
        const sessionId = searchParams.get('sessionId');

        if (!streamId || !sessionId) {
            return NextResponse.json({ error: 'Missing streamId or sessionId' }, { status: 400 });
        }

        // Use D-ID's test audio URL (publicly accessible)
        const testAudioUrl = 'https://d-id-public-bucket.s3.amazonaws.com/webrtc.mp3';

        const encoded = Buffer.from(apiKey).toString('base64');

        const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encoded}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                script: {
                    type: 'audio',
                    audio_url: testAudioUrl,
                },
                driver_url: 'bank://lively/',
                config: {
                    stitch: true,
                },
                session_id: sessionId,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: response.status });
        }

        return NextResponse.json({ success: true, message: 'Test audio sent' });

    } catch (error: any) {
        console.error('Test audio error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
