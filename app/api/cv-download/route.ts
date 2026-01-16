import { NextRequest, NextResponse } from 'next/server';
import pdfSessionStorage from '@/lib/pdf-session-storage';

/**
 * CV Download Endpoint
 * 
 * Downloads PDF from session cache using session ID
 * One-time use - session is deleted after retrieval
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing session parameter' },
                { status: 400 }
            );
        }

        // Retrieve PDF from session storage (one-time use)
        const session = pdfSessionStorage.retrieve(sessionId);

        if (!session) {
            console.error(`[Download API] Session ${sessionId} NOT FOUND. Debug info:`, JSON.stringify(pdfSessionStorage.debug(), null, 2));
            return NextResponse.json(
                {
                    error: 'Session not found or expired',
                    details: 'Sessions expire after 5 minutes. Please generate a new PDF.',
                },
                { status: 404 }
            );
        }

        const { pdfBuffer, filename } = session;

        console.log(`[Download API] Serving ${filename} (${pdfBuffer.length} bytes) for session ${sessionId}`);

        // Return PDF - Blob URL method handles download client-side
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('[Download API] Error:', error);

        return NextResponse.json(
            {
                error: 'Failed to download PDF',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
