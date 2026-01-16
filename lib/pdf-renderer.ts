import type { CVData } from '@/actions/cv-builder';
import type { TemplateId } from '@/types/cv-templates';

/**
 * PDF Renderer Utilities
 * Converts CV data to HTML strings optimized for PDF generation
 * Includes inline styles, base64 image conversion, and watermarks
 */

interface PDFOptions {
  includeWatermark?: boolean;
  watermarkText?: string;
  customHeader?: string;
  customFooter?: string;
  pageNumbers?: boolean;
}

/**
 * Convert image URL to base64 data URI
 * This ensures images work in PDF generation without needing external URLs
 */
export async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    return ''; // Return empty string if image conversion fails
  }
}

/**
 * Generate CSS styles for PDF (inline to ensure compatibility)
 */
function generatePDFStyles(accentColor: string): string {
  return `
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #1f2937;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Force background colors to print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Watermark styling */
      .pdf-watermark {
        position: fixed;
        bottom: 15mm;
        right: 15mm;
        opacity: 0.08;
        font-size: 64px;
        font-weight: bold;
        color: ${accentColor};
        transform: rotate(-45deg);
        pointer-events: none;
        z-index: 9999;
      }

      /* Custom header */
      .pdf-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 10mm;
        background: ${accentColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
      }

      /* Custom footer with page numbers */
      .pdf-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8mm;
        background: #f3f4f6;
        border-top: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10mm;
        font-size: 9px;
        color: #6b7280;
      }

      /* Page break utilities */
      .page-break-before {
        page-break-before: always;
      }

      .page-break-after {
        page-break-after: always;
      }

      .page-break-avoid {
        page-break-inside: avoid;
      }

      /* Ensure QR codes and images print correctly */
      canvas, svg, img {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    </style>
  `;
}

/**
 * Add watermark to HTML
 */
function addWatermark(watermarkText: string): string {
  return `<div class="pdf-watermark">${watermarkText}</div>`;
}

/**
 * Add custom header to HTML
 */
function addCustomHeader(headerText: string): string {
  return `<div class="pdf-header">${headerText}</div>`;
}

/**
 * Add custom footer with optional page numbers
 */
function addCustomFooter(footerText: string, includePageNumbers: boolean): string {
  return `
    <div class="pdf-footer">
      <span>${footerText}</span>
      ${includePageNumbers ? '<span class="page-number"></span>' : ''}
    </div>
  `;
}

/**
 * Render Modern Template to HTML string
 */
function renderModernTemplate(data: CVData, accentColor: string, photoBase64?: string): string {
  const profilePhoto = photoBase64 || '';

  return `
    <div class="flex" style="display: flex; background: white;">
      <!-- Left Sidebar -->
      <div style="width: 33.333%; background-color: ${accentColor}; color: white; padding: 32px; padding-bottom: 80px;">
        <h1 style="font-weight: bold; font-size: 32px; line-height: 1.2; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis;">${data.personal.fullName}</h1>
        <p style="color: rgba(255,255,255,0.8); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px; margin-bottom: 32px;">${data.personal.jobTitle}</p>

        ${data.personal.liveCvUrl ? `
          <div style="margin-bottom: 24px; display: flex; justify-content: flex-end;">
            <div style="background: white; padding: 8px; border-radius: 4px;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <!-- QR Code will be generated by backend -->
              </svg>
              <p style="font-size: 10px; text-align: center; margin-top: 4px; color: #4b5563;">Scan voor online CV</p>
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 32px; opacity: 0.9; font-size: 14px; line-height: 1.45;">
          <p style="margin-bottom: 8px;">${data.personal.email}</p>
          <p style="margin-bottom: 8px;">${data.personal.phone}</p>
          <p>${data.personal.address}</p>
        </div>

        <h3 style="font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 8px; margin-bottom: 16px; text-transform: uppercase; font-size: 18px;">Vaardigheden</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${data.skills.map(skill => `
            <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 14px;">${skill}</span>
          `).join('')}
        </div>

        ${data.languages && data.languages.length > 0 ? `
          <h3 style="font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 8px; margin-bottom: 16px; text-transform: uppercase; font-size: 18px; margin-top: 32px;">Talen</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${data.languages.map(lang => `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px;">${lang.language}</span>
                <span style="font-size: 12px; opacity: 0.7;">${lang.proficiency}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Right Content -->
      <div style="width: 66.666%; padding: 32px;">
        <div style="margin-bottom: 32px;">
          <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; color: #1f2937; font-size: 20px; color: ${accentColor};">Profiel</h3>
          <p style="color: #374151; font-size: 14px; line-height: 1.45;">${data.personal.summary}</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; color: #1f2937; font-size: 20px; color: ${accentColor};">Werkervaring</h3>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 24px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h4 style="font-weight: bold; color: #111827; font-size: 18px;">${exp.role}</h4>
                <span style="color: #6b7280; font-size: 14px; font-weight: 600;">${exp.start} - ${exp.end}</span>
              </div>
              <div style="color: #4b5563; font-weight: 600; margin-bottom: 8px; font-size: 14px;">${exp.company}</div>
              <ul style="color: #374151; list-style-type: disc; padding-left: 20px; font-size: 14px; line-height: 1.45;">
                ${exp.description.split('.').filter(s => s.trim()).map(bullet => `
                  <li>${bullet.trim()}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        ${data.education && data.education.length > 0 ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; color: #1f2937; font-size: 20px; color: ${accentColor};">Opleidingen</h3>
            ${data.education.map(edu => `
              <div style="margin-bottom: 24px; page-break-inside: avoid;">
                <h4 style="font-weight: bold; color: #111827; font-size: 18px;">${edu.degree}</h4>
                <div style="color: #6b7280; font-weight: 600; margin-bottom: 8px; font-size: 14px;">
                  ${edu.school} | ${edu.start} - ${edu.end}
                </div>
                ${edu.description ? `
                  <p style="color: #374151; font-size: 14px; line-height: 1.45;">${edu.description}</p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Main function: Render CV template to complete HTML string for PDF generation
 */
export async function renderTemplateToHTML(
  data: CVData,
  template: TemplateId,
  accentColor: string,
  options: PDFOptions = {}
): Promise<string> {
  // Convert profile photo to base64 if it exists
  let photoBase64 = '';
  if (data.personal?.profilePhotoUrl) {
    try {
      photoBase64 = await convertImageToBase64(data.personal.profilePhotoUrl);
    } catch (error) {
      console.warn('Failed to convert profile photo, continuing without it:', error);
    }
  }

  // Generate template HTML
  let templateHTML = '';
  switch (template) {
    case 'modern':
      templateHTML = renderModernTemplate(data, accentColor, photoBase64);
      break;
    // Additional templates would be added here (classic-sidebar, modern-header, photo-focus)
    default:
      templateHTML = renderModernTemplate(data, accentColor, photoBase64);
  }

  // Build complete HTML document
  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.personal.fullName} - CV</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      ${generatePDFStyles(accentColor)}
    </head>
    <body>
      ${options.customHeader ? addCustomHeader(options.customHeader) : ''}
      ${options.includeWatermark ? addWatermark(options.watermarkText || 'Cevace') : ''}
      
      <div style="width: 210mm; min-height: 297mm; background: white;">
        ${templateHTML}
      </div>

      ${options.customFooter ? addCustomFooter(options.customFooter, options.pageNumbers || false) : ''}
    </body>
    </html>
  `;

  return html;
}

/**
 * Generate PDF metadata
 */
export function generatePDFMetadata(data: CVData) {
  return {
    title: `${data.personal.fullName} - CV`,
    author: data.personal.fullName,
    subject: `Curriculum Vitae - ${data.personal.jobTitle}`,
    keywords: `CV, Resume, ${data.personal.jobTitle}, ${data.skills.join(', ')}`,
    creator: 'Cevace - CV Builder',
    creationDate: new Date(),
  };
}
