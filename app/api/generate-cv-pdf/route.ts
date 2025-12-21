import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import HarvardTemplate from '@/components/pdf/HarvardTemplate';

/**
 * Generate CV PDF from edited resume data
 * Uses HarvardTemplate to render professional PDF with Live CV QR code
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resume } = body;

        if (!resume || !resume.personal || !resume.experiences) {
            return NextResponse.json({
                error: 'Invalid resume data: missing personal or experiences'
            }, { status: 400 });
        }

        console.log('Generating PDF for resume with', resume.experiences.length, 'experiences');

        // Generate Live CV QR code
        const { generateLiveCvQRCode, getUserLiveCvUrl } = await import('@/lib/motivation-letter/qr-generator');

        let liveCvUrl: string | undefined;
        let qrCodeDataUrl: string | undefined;

        try {
            liveCvUrl = await getUserLiveCvUrl(user.id);
            if (liveCvUrl) {
                qrCodeDataUrl = await generateLiveCvQRCode(liveCvUrl);
            }
        } catch (error) {
            console.warn('Failed to generate QR code, continuing without it:', error);
            // Continue without QR code if it fails
        }

        // Add QR code data to resume
        const resumeWithQR = {
            ...resume,
            liveCvUrl,
            qrCodeDataUrl
        };

        // Generate PDF using @react-pdf/renderer (without JSX syntax)
        const pdfDocument = React.createElement(HarvardTemplate, { data: resumeWithQR });
        const blob = await pdf(pdfDocument as any).toBlob();

        console.log(`PDF generated: ${(blob.size / 1024).toFixed(2)} KB`);

        // Convert blob to buffer for Next.js response
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Return as PDF
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="optimized-cv.pdf"',
            },
        });

    } catch (error: any) {
        console.error('Generate CV PDF error:', error);
        return NextResponse.json({
            error: `PDF generation failed: ${error.message}`
        }, { status: 500 });
    }
}
