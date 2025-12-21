import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { submitICECandidate } from '@/lib/interview-coach/d-id-client';

/**
 * Submit ICE Candidate to D-ID Stream
 * POST /api/coach/d-id/ice-candidate
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get D-ID API key
        const apiKey = process.env.DID_API_KEY;
        if (!apiKey) {
            console.error('D-ID API key not configured');
            return NextResponse.json({ error: 'Video service not configured' }, { status: 500 });
        }

        // 3. Parse request
        const { streamId, sessionId, candidate } = await req.json();

        if (!streamId || !sessionId || !candidate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 4. Forward to D-ID
        await submitICECandidate(apiKey, streamId, sessionId, candidate as RTCIceCandidate);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('ICE candidate submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
