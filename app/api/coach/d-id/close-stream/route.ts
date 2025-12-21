import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { closeDIDStream } from '@/lib/interview-coach/d-id-client';

/**
 * Close D-ID Stream
 * Cleanup stream resources
 */
export async function POST(req: NextRequest) {
    try {
        // 1. AUTH CHECK
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { streamId, sessionId } = await req.json();

        if (!streamId || !sessionId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const apiKey = process.env.DID_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Video service not configured' }, { status: 500 });
        }

        // Close stream (best-effort, doesn't throw)
        await closeDIDStream(apiKey, streamId, sessionId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('D-ID stream close error:', error);
        // Still return success - cleanup is best-effort
        return NextResponse.json({ success: true });
    }
}
