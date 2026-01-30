import { NextRequest, NextResponse } from 'next/server';
import { renderTemplateToHTML, generatePDFMetadata } from '@/lib/pdf-renderer';
import pdfSessionStorage from '@/lib/pdf-session-storage';
import type { CVData } from '@/actions/cv-builder';
import type { TemplateId } from '@/types/cv-templates';

/**
 * CV Builder PDF Session Creation Endpoint
 * 
 * Generates PDF and stores it in session cache, returns session ID
 * for later download via /api/cv-download
 */

interface GeneratePDFRequest {
    cvData: CVData;
    template: TemplateId;
    accentColor: string;
    font?: string;
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
        const { cvData, template, accentColor, font = 'inter', options = {} } = body;

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
                },
                { status: 400 }
            );
        }

        // Generate HTML string from CV data
        const htmlContent = await renderTemplateToHTML(
            cvData,
            template,
            accentColor,
            options,
            font
        );

        console.log(`[Session API] Generated HTML length: ${htmlContent.length} characters`);

        // Generate PDF metadata
        const metadata = generatePDFMetadata(cvData);

        // Check if Browserless API key is available
        const browserlessApiKey = process.env.BROWSERLESS_API_KEY;

        let pdfBuffer: Buffer;

        if (browserlessApiKey) {
            // PRODUCTION: Use Browserless.io for reliable PDF generation
            console.log('[Session API] Using Browserless.io for PDF generation');

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
                    },
                    waitForTimeout: 500,
                }),
            });

            if (!browserlessResponse.ok) {
                const errorText = await browserlessResponse.text();
                console.error('[Session API] Browserless error:', errorText);
                throw new Error(`Browserless API error (${browserlessResponse.status}): ${errorText.substring(0, 200)}`);
            }

            const arrayBuffer = await browserlessResponse.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
        } else {
            console.error('[Session API] BROWSERLESS_API_KEY not configured');
            return NextResponse.json(
                {
                    error: 'PDF generation service not configured',
                    details: 'Please set BROWSERLESS_API_KEY environment variable',
                },
                { status: 503 }
            );
        }

        // Sanitize filename
        const sanitizeFilename = (name: string): string => {
            return name
                .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
                .replace(/\s+/g, '_')
                .replace(/_{2,}/g, '_')
                .substring(0, 200)
                .replace(/^\.+/, '')
                || 'CV';
        };

        const fullName = cvData?.personal?.fullName || 'CV';
        const filename = `${sanitizeFilename(fullName)}_CV.pdf`;

        // Store PDF in session cache
        const { sessionId, expiresAt } = pdfSessionStorage.store(pdfBuffer, filename);

        console.log(`[Session API] Created session ${sessionId} for ${filename}`);
        console.log(`[Session API] DEBUG STATE:`, JSON.stringify(pdfSessionStorage.debug(), null, 2));
        console.log(`[Session API] DEBUG:`, JSON.stringify(pdfSessionStorage.debug(), null, 2));

        // Return session info
        return NextResponse.json({
            sessionId,
            filename,
            expiresAt: expiresAt.toISOString(),
            size: pdfBuffer.length,
        });
    } catch (error) {
        console.error('[Session API] PDF generation error:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate PDF',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
