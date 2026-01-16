import { NextRequest, NextResponse } from 'next/server';
import { renderTemplateToHTML, generatePDFMetadata } from '@/lib/pdf-renderer';
import type { CVData } from '@/actions/cv-builder';
import type { TemplateId } from '@/types/cv-templates';

/**
 * CV Builder PDF Generation API Endpoint
 * 
 * Accepts CV data and template information, generates a perfect A4 PDF
 * Uses Browserless.io for production or Puppeteer for development
 */

interface GeneratePDFRequest {
    cvData: CVData;
    template: TemplateId;
    accentColor: string;
    options?: {
        includeWatermark?: boolean;
        watermarkText?: string;
        customHeader?: string;
        customFooter?: string;
        pageNumbers?: boolean;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: GeneratePDFRequest = await request.json();
        const { cvData, template, accentColor, options = {} } = body;

        // Validate required fields
        if (!cvData || !template || !accentColor) {
            return NextResponse.json(
                { error: 'Missing required fields: cvData, template, accentColor' },
                { status: 400 }
            );
        }

        // Validate cvData structure 
        if (!cvData.personal || !cvData.personal.fullName) {
            console.error('Invalid cvData structure:', JSON.stringify(cvData, null, 2));
            return NextResponse.json(
                {
                    error: 'Invalid CV data structure',
                    details: 'cvData.personal.fullName is required',
                    received: cvData
                },
                { status: 400 }
            );
        }

        // Generate HTML string from CV data
        const htmlContent = await renderTemplateToHTML(
            cvData,
            template,
            accentColor,
            options);

        console.log(`Generated HTML length: ${htmlContent.length} characters`);

        // Generate PDF metadata
        const metadata = generatePDFMetadata(cvData);

        // Check if Browserless API key is available
        const browserlessApiKey = process.env.BROWSERLESS_API_KEY;

        let pdfBuffer: Buffer;

        if (browserlessApiKey) {
            // PRODUCTION: Use Browserless.io for reliable, scalable PDF generation
            console.log('Using Browserless.io for PDF generation');

            // Browserless requires token as query parameter, not Authorization header
            const browserlessResponse = await fetch(`https://chrome.browserless.io/pdf?token=${browserlessApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: htmlContent,
                    options: {
                        format: 'A4',
                        printBackground: true,
                        margin: {
                            top: '0mm',
                            right: '0mm',
                            bottom: '0mm',
                            left: '0mm',
                        },
                        preferCSSPageSize: false,
                        displayHeaderFooter: false,
                        // PDF metadata (Browserless supports some metadata via Chrome)
                    },
                    waitForTimeout: 500, // Wait for fonts/images to load
                }),
            });

            if (!browserlessResponse.ok) {
                const errorText = await browserlessResponse.text();
                console.error('Browserless API error response:', errorText);
                console.error('Browserless API status:', browserlessResponse.status);
                console.error('Browserless API statusText:', browserlessResponse.statusText);

                // Try to parse error as JSON for more details
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Browserless error details:', errorJson);
                } catch (e) {
                    // Not JSON, already logged as text
                }

                throw new Error(`Browserless API error (${browserlessResponse.status}): ${errorText.substring(0, 200)}`);
            }

            const arrayBuffer = await browserlessResponse.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
        } else {
            // No Browserless API key configured
            console.error('BROWSERLESS_API_KEY not configured');
            return NextResponse.json(
                {
                    error: 'PDF generation service not configured',
                    details: 'Please set BROWSERLESS_API_KEY environment variable in .env.local',
                },
                { status: 503 }
            );
        }

        // Generate filename
        const filename = `${cvData.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`;

        // Return PDF as downloadable file (convert Buffer to Uint8Array for NextResponse)
        return new NextResponse(Uint8Array.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length.toString(),
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate PDF',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint to check API health
export async function GET() {
    const browserlessConfigured = !!process.env.BROWSERLESS_API_KEY;

    return NextResponse.json({
        status: 'online',
        service: 'CV Builder PDF Generation API',
        browserlessConfigured,
        message: browserlessConfigured
            ? 'Using Browserless.io for PDF generation'
            : 'Using Puppeteer fallback (install Browserless.io for production)',
    });
}
