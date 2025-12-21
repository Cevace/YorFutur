import { pdf } from '@react-pdf/renderer';
import React from 'react';
import MotivationLetterPDF from '@/components/pdf/MotivationLetterPDF';

export interface MotivationLetterPDFData {
    candidateName: string;
    candidateEmail: string;
    candidatePhone?: string;
    candidateAddress?: string;
    candidateCity?: string;
    companyName?: string;
    contactPerson?: string;
    companyAddress?: string;
    letterContent: string;
    selectedDate: Date;
    liveCvUrl?: string;
    qrCodeDataUrl?: string;
}

/**
 * Generate PDF blob for motivation letter (client-side)
 */
export async function generateMotivationLetterPDF(data: MotivationLetterPDFData): Promise<Blob> {
    try {
        // Create PDF instance using createElement (no JSX in .ts files)
        const doc = React.createElement(MotivationLetterPDF, { data });
        const asPdf = pdf(doc as any);
        const blob = await asPdf.toBlob();
        return blob;
    } catch (error) {
        console.error('[generateMotivationLetterPDF] Error:', error);
        throw error;
    }
}

/**
 * Generate filename for PDF download
 */
export function generatePDFFilename(companyName?: string): string {
    const date = new Date().toISOString().split('T')[0];
    const slug = companyName
        ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)
        : 'motivatiebrief';
    return `${slug}-${date}.pdf`;
}
