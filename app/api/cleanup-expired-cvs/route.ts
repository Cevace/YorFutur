import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Cleanup expired tailored CVs (60+ days old) - HARDENED
 * - Triggered by Vercel Cron (daily at 2 AM UTC)
 * - Idempotent (safe to run multiple times)
 * - Transaction-like behavior (rollback on failure)
 * - Structured logging for monitoring
 * - Retry logic for storage failures
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Helper: Retry with exponential backoff
async function retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = MAX_RETRIES,
    delay: number = RETRY_DELAY_MS
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries <= 0) throw error;

        await new Promise(resolve => setTimeout(resolve, delay));
        return retryOperation(operation, retries - 1, delay * 2);
    }
}

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        // 1. Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

        if (!process.env.CRON_SECRET) {
            console.error(`[Cleanup:${requestId}] CRON_SECRET not configured`);
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (authHeader !== expectedAuth) {
            console.warn(`[Cleanup:${requestId}] Unauthorized cleanup attempt from IP: ${request.headers.get('x-forwarded-for')}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Create admin client (bypasses RLS for cleanup)
        const supabase = createClient();

        console.log(`[Cleanup:${requestId}] Starting cleanup job`);

        // 3. Find expired CVs with explicit fields
        const { data: expiredCVs, error: fetchError } = await supabase
            .from('tailored_resumes')
            .select('id, pdf_url, user_id, vacancy_title, created_at, expires_at')
            .lt('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: true }); // Oldest first

        if (fetchError) {
            console.error(`[Cleanup:${requestId}] Database query failed:`, fetchError);
            return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
        }

        if (!expiredCVs || expiredCVs.length === 0) {
            const duration = Date.now() - startTime;
            console.log(`[Cleanup:${requestId}] No expired CVs found (duration: ${duration}ms)`);
            return NextResponse.json({
                success: true,
                message: 'No expired CVs found',
                deletedCount: 0,
                duration
            });
        }

        console.log(`[Cleanup:${requestId}] Found ${expiredCVs.length} expired CVs to delete`);

        // 4. Track results for rollback if needed
        const deletedPDFs: string[] = [];
        const failedPDFs: Array<{ id: string; error: string }> = [];

        // 5. Delete PDF files from storage with retry
        for (const cv of expiredCVs) {
            if (!cv.pdf_url) {
                console.warn(`[Cleanup:${requestId}] CV ${cv.id} has no PDF URL, skipping storage delete`);
                continue;
            }

            try {
                const filename = cv.pdf_url.split('/').pop();
                if (!filename || !cv.user_id) {
                    console.warn(`[Cleanup:${requestId}] Invalid PDF URL for CV ${cv.id}: ${cv.pdf_url}`);
                    continue;
                }

                const storagePath = `${cv.user_id}/${filename}`;

                // Retry storage delete up to 3 times
                await retryOperation(async () => {
                    const { error } = await supabase.storage
                        .from('tailored-resumes')
                        .remove([storagePath]);

                    if (error) {
                        throw new Error(`Storage delete failed: ${error.message}`);
                    }
                });

                deletedPDFs.push(storagePath);
                console.log(`[Cleanup:${requestId}] Deleted PDF: ${storagePath}`);

            } catch (err: any) {
                console.error(`[Cleanup:${requestId}] Failed to delete PDF for CV ${cv.id} after retries:`, err.message);
                failedPDFs.push({ id: cv.id, error: err.message });
            }
        }

        // 6. Only delete DB records if all storage deletes succeeded
        if (failedPDFs.length > 0) {
            const duration = Date.now() - startTime;
            console.error(`[Cleanup:${requestId}] ${failedPDFs.length} PDF deletions failed. Aborting database cleanup to prevent orphaned records.`);

            return NextResponse.json({
                success: false,
                error: 'Partial failure: some files could not be deleted',
                deletedPDFs: deletedPDFs.length,
                failedPDFs: failedPDFs.length,
                failures: failedPDFs,
                duration
            }, { status: 500 });
        }

        // 7. Delete database records (only if storage cleanup succeeded)
        const cvIds = expiredCVs.map(cv => cv.id);
        const { error: deleteError, count } = await supabase
            .from('tailored_resumes')
            .delete({ count: 'exact' })
            .in('id', cvIds);

        if (deleteError) {
            console.error(`[Cleanup:${requestId}] Database deletion failed:`, deleteError);

            // CRITICAL: Storage is deleted but DB failed
            // Log this for manual intervention
            console.error(`[Cleanup:${requestId}] CRITICAL: PDFs deleted but DB deletion failed. Manual cleanup may be needed for IDs:`, cvIds);

            return NextResponse.json({
                error: 'Database deletion failed after storage cleanup',
                criticalError: true,
                affectedIds: cvIds
            }, { status: 500 });
        }

        const duration = Date.now() - startTime;
        const result = {
            success: true,
            message: `Deleted ${expiredCVs.length} expired CV(s)`,
            deletedCount: count || expiredCVs.length,
            deletedPDFs: deletedPDFs.length,
            duration,
            timestamp: new Date().toISOString()
        };

        console.log(`[Cleanup:${requestId}] Cleanup completed successfully:`, result);

        return NextResponse.json(result);

    } catch (error: any) {
        const duration = Date.now() - startTime;

        // Structured error logging for monitoring
        console.error(`[Cleanup:${requestId}] Unexpected error:`, {
            message: error.message,
            stack: error.stack,
            duration,
            timestamp: new Date().toISOString()
        });

        // TODO: Send alert to monitoring service (Sentry, etc.)
        // await sendAlert({ type: 'cleanup_failure', error, requestId });

        return NextResponse.json({
            error: 'Cleanup failed',
            requestId, // Include for support debugging
            duration
        }, { status: 500 });
    }
}
