import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { submitSDPAnswer } from '@/lib/interview-coach/d-id-client';

/**
 * Submit SDP Answer to D-ID
 * Completes WebRTC negotiation
 */
export async function POST(req: NextRequest) {
    try {
        // 1. AUTH CHECK
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { streamId, sessionId, answer } = await req.json();

        if (!streamId || !sessionId || !answer) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const apiKey = process.env.DID_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Video service not configured' }, { status: 500 });
        }

        // Submit SDP answer
        await submitSDPAnswer(apiKey, streamId, sessionId, answer);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('D-ID SDP answer error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json(
            { error: error.message || 'Failed to submit answer' },
            { status: 500 }
        );
    }
}
