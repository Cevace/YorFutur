import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Cron job endpoint to cleanup expired CV Tuner sessions
 * Call this endpoint daily via:
 * - Vercel Cron Jobs (vercel.json)
 * - External cron service (e.g., cron-job.org)
 * - Manual API call
 * 
 * Security: Protected by CRON_SECRET environment variable
 */
export async function GET(req: NextRequest) {
    try {
        // Security: Verify cron secret
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error('[CRON] CRON_SECRET not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Check authorization header (format: "Bearer <secret>")
        const providedSecret = authHeader?.replace('Bearer ', '');

        if (providedSecret !== cronSecret) {
            console.warn('[CRON] Unauthorized cleanup attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Call Supabase cleanup function
        const supabase = createClient();

        const { data, error } = await supabase.rpc('cleanup_expired_tuner_sessions');

        if (error) {
            console.error('[CRON] Cleanup error:', error);
            return NextResponse.json(
                { error: 'Cleanup failed', details: error.message },
                { status: 500 }
            );
        }

        const deletedCount = data || 0;

        console.log(`[CRON] Cleanup successful: ${deletedCount} sessions removed`);

        return NextResponse.json({
            success: true,
            deletedCount,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[CRON] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// Also support POST for flexibility
export async function POST(req: NextRequest) {
    return GET(req);
}
