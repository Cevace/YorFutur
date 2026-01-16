import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to test Browserless API connection
 * Visit: http://localhost:3000/api/test-browserless
 */
export async function GET() {
    const browserlessApiKey = process.env.BROWSERLESS_API_KEY;

    if (!browserlessApiKey) {
        return NextResponse.json({
            success: false,
            error: 'BROWSERLESS_API_KEY not configured',
            message: 'Please add BROWSERLESS_API_KEY to your .env.local file',
        });
    }

    // Test with minimal HTML
    const minimalHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body><h1>Test PDF</h1></body>
        </html>
    `;

    try {
        console.log('Testing Browserless.io API...');
        console.log('API Key (first 10 chars):', browserlessApiKey.substring(0, 10) + '...');

        // Browserless requires token as query parameter, not Authorization header
        const response = await fetch(`https://chrome.browserless.io/pdf?token=${browserlessApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: minimalHTML,
                options: {
                    format: 'A4',
                    printBackground: true,
                },
            }),
        });

        console.log('Browserless response status:', response.status);
        console.log('Browserless response statusText:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Browserless error response:', errorText);

            return NextResponse.json({
                success: false,
                error: 'Browserless API request failed',
                status: response.status,
                statusText: response.statusText,
                details: errorText.substring(0, 500),
            });
        }

        // Check if we got a PDF back
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');

        return NextResponse.json({
            success: true,
            message: 'Browserless API is working correctly!',
            contentType,
            contentLength,
            status: response.status,
        });
    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
