import type { CVData } from '@/actions/cv-builder';
import type { TemplateId } from '@/types/cv-templates';
import { renderCVModernTemplatePDF } from '@/components/cv-templates/CVModernTemplatePDF';

/**
 * PDF Renderer Utilities
 * Converts CV data to HTML strings optimized for PDF generation
 * 
 * ARCHITECTURE: Fixed A4 Architecture
 * The PDF renderer now uses shared template components from /components/cv-templates/
 * to ensure visual parity between screen preview and PDF output.
 */

interface PDFOptions {
  includeWatermark?: boolean;
  watermarkText?: string;
  customHeader?: string;
  customFooter?: string;
  pageNumbers?: boolean;
}

function getGoogleFontLink(fontId: string): string {
  switch (fontId) {
    case 'roboto': return '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">';
    case 'open-sans': return '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">';
    case 'lato': return '<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">';
    case 'merriweather': return '<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet">';
    case 'playfair': return '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">';
    case 'lora': return '<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap" rel="stylesheet">';
    case 'inter':
    default:
      return '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">';
  }
}

const ICONS = {
  mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity:0.7;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
  phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity:0.7;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
  mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity:0.7;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
};

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
/**
 * Generate CSS styles for PDF (inline to ensure compatibility)
 */
function generatePDFStyles(accentColor: string, fontRequest: string = 'Inter'): string {
  // Map font ID to actual CSS font family if needed, or pass through
  // For now we assume fontRequest is the ID, but let's handle the mapping based on common IDs
  const fontMap: Record<string, string> = {
    'inter': "'Inter', sans-serif",
    'roboto': "'Roboto', sans-serif",
    'open-sans': "'Open Sans', sans-serif",
    'lato': "'Lato', sans-serif",
    'merriweather': "'Merriweather', serif",
    'playfair': "'Playfair Display', serif",
    'lora': "'Lora', serif"
  };

  const fontFamily = fontMap[fontRequest] || "'Inter', sans-serif";

  return `
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* @page margins apply to EVERY page for Word-like flow */
      /* Sidebar will extend beyond these margins using negative positioning */
      @page {
        size: A4 portrait;
        margin: 20mm 0 20mm 0;
      }

      body {
        font-family: ${fontFamily};
        color: #1f2937;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Content area - this flows naturally with @page margins */
      .cv-content {
        /* The @page margin-top/bottom will push content down/up automatically */
        /* This creates the Word-like page flow behavior */
      }

      /* Sidebar stays fixed on all pages */
      .cv-sidebar-bg {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 70mm;
        z-index: 1;
      }

      .cv-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 70mm;
        z-index: 2;
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

      /* Page break utilities - both legacy and modern CSS */
      .page-break-before {
        page-break-before: always;
        break-before: page;
      }

      .page-break-after {
        page-break-after: always;
        break-after: page;
      }

      .page-break-avoid {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Experience and education blocks should never break across pages */
      .cv-block {
        page-break-inside: avoid;
        break-inside: avoid;
        orphans: 3;
        widows: 3;
      }

      /* Ensure QR codes and images print correctly */
      canvas, svg, img {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* List styling for experience descriptions */
      ul {
        list-style-type: disc;
        padding-left: 20px;
        margin: 8px 0;
      }						      ol {
        list-style-type: decimal;
        padding-left: 20px;
        margin: 8px 0;
      }
      li {
        margin-bottom: 4px;
      }
      strong {
        font-weight: 700;
      }
      em {
        font-style: italic;
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
    <!-- Fixed Sidebar Background ensuring color on all pages -->
    <div style="position: fixed; top: 0; left: 0; bottom: 0; width: 33.33%; background-color: ${accentColor}; z-index: -1; -webkit-print-color-adjust: exact;"></div>

    <div class="flex" style="display: flex; min-height: 297mm; position: relative;">
      <!-- Left Sidebar Content -->
      <div style="width: 33.33%; color: white; padding-left: 20mm; padding-right: 5mm; display: flex; flex-direction: column;">
        <h1 style="font-weight: bold; font-size: 32px; line-height: 1.1; margin-bottom: 8px; word-wrap: break-word;">${data.personal.fullName}</h1>
        <p style="color: rgba(255,255,255,0.8); font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin-bottom: 32px;">${data.personal.jobTitle}</p>

        <div style="margin-bottom: 32px; opacity: 0.9; font-size: 14px; line-height: 1.6;">
          <p style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">${ICONS.mail} <span style="margin-left: 6px;">${data.personal.email}</span></p>
          <p style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">${ICONS.phone} <span style="margin-left: 6px;">${data.personal.phone}</span></p>
          <p style="display: flex; align-items: center; gap: 8px;">${ICONS.mapPin} <span style="margin-left: 6px;">${data.personal.address}</span></p>
        </div>

        <h3 style="font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 12px; margin-bottom: 16px; text-transform: uppercase; font-size: 16px; letter-spacing: 0.1em;">Vaardigheden</h3>
        <div style="margin-bottom: 32px; font-size: 13px; font-weight: 500; line-height: 1.6; opacity: 0.9;">
         ${data.skills.map((skill, i) => `
            <span>${skill}${i < data.skills.length - 1 ? ',' : ''}</span>
         `).join(' ')}
        </div>

        ${data.languages && data.languages.length > 0 ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 12px; margin-bottom: 16px; text-transform: uppercase; font-size: 16px; letter-spacing: 0.1em;">Talen</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${data.languages.map(lang => `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 14px; font-weight: 500;">${lang.language}</span>
                  <span style="font-size: 12px; opacity: 0.7;">${lang.proficiency}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${data.personal.liveCvUrl ? `
          <div style="position: absolute; top: 260mm; left: 20mm; width: 33%;">
            <div style="background: white; padding: 8px; border-radius: 8px; display: inline-block;">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.personal.liveCvUrl)}" width="70" height="70" />
            </div>
            <p style="font-size: 10px; margin-top: 8px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Scan voor Live CV</p>
          </div>
        ` : ''}
      </div>

      <!-- Right Content -->
      <div style="width: 66.666%; padding-left: 10mm; padding-right: 20mm; background: white;">
        <div style="margin-bottom: 40px;">
          <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid ${accentColor}; color: ${accentColor}; font-size: 18px;">Profiel</h3>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; text-align: justify;">${data.personal.summary}</p>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 2px solid ${accentColor}; color: ${accentColor}; font-size: 18px;">Werkervaring</h3>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 32px; page-break-inside: avoid; border-left: 2px solid #f3f4f6; padding-left: 16px;">
              <div style="margin-bottom: 8px;">
                <h4 style="font-weight: bold; color: #111827; font-size: 18px; line-height: 1.2; margin-bottom: 4px;">${exp.role}</h4>
                <div style="color: #6b7280; font-size: 14px; font-weight: 500;">
                    <span style="color: #374151;">${exp.company}</span>
                    <span style="margin: 0 8px;">•</span>
                    <span>${exp.start} - ${exp.end}</span>
                </div>
              </div>
              <div 
                  style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 8px;" 
                  class="prose"
              >
                ${exp.description}
              </div>
            </div>
          `).join('')}
        </div>

        ${data.education && data.education.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 2px solid ${accentColor}; color: ${accentColor}; font-size: 18px;">Opleidingen</h3>
            ${data.education.map(edu => `
              <div style="margin-bottom: 24px; page-break-inside: avoid; border-left: 2px solid #f3f4f6; padding-left: 16px;">
                <h4 style="font-weight: bold; color: #111827; font-size: 18px; line-height: 1.2; margin-bottom: 4px;">${edu.degree}</h4>
                <div style="color: #6b7280; font-weight: 500; margin-bottom: 8px; font-size: 14px;">
                  ${edu.school} <span style="margin: 0 8px;">•</span> ${edu.start} - ${edu.end}
                </div>
                ${edu.description ? `
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-top: 4px;">${edu.description}</p>
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
 * Render Classic Sidebar Template to HTML string
 */
function renderClassicSidebarTemplate(data: CVData, accentColor: string, photoBase64?: string): string {
  const profilePhoto = photoBase64 || '';

  return `
    <!-- Fixed Sidebar Background ensuring color on all pages -->
    <div style="position: fixed; top: 0; left: 0; bottom: 0; width: 30%; background-color: ${accentColor}; z-index: 0; -webkit-print-color-adjust: exact;"></div>

    <div class="flex" style="display: flex; min-height: 297mm; position: relative; z-index: 1;">
      <!-- Left Sidebar (30%) -->
      <div style="width: 30%; color: white; padding: 32px; padding-top: 25mm; padding-bottom: 25mm;">
        ${profilePhoto ? `
          <div style="margin-bottom: 32px; display: flex; justify-content: center;">
            <div style="width: 128px; height: 128px; border-radius: 50%; overflow: hidden; border: 4px solid white;">
              <img src="${profilePhoto}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          </div>
        ` : ''}

        <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; font-size: 20px;">Personalia</h3>
        <div style="font-size: 14px; margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px;">
          <div>
            <p style="font-weight: 600;">Naam</p>
            <p style="opacity: 0.9;">${data.personal.fullName}</p>
          </div>
          <div>
            <p style="font-weight: 600;">E-mailadres</p>
            <p style="opacity: 0.9;">${data.personal.email}</p>
          </div>
          <div>
            <p style="font-weight: 600;">Telefoonnummer</p>
            <p style="opacity: 0.9;">${data.personal.phone}</p>
          </div>
          <div>
            <p style="font-weight: 600;">Adres</p>
            <p style="opacity: 0.9;">${data.personal.address}</p>
          </div>
          ${data.personal.liveCvUrl ? `
             <div>
                <p style="font-weight: 600;">LinkedIn</p>
                <p style="opacity: 0.9; font-size: 10px; word-break: break-all;">linkedin.com/in/${data.personal.fullName.toLowerCase().replace(/\s+/g, '')}</p>
             </div>
          ` : ''}
        </div>

        <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; font-size: 20px;">Vaardigheden</h3>
        <div style="font-size: 14px; margin-bottom: 32px; display: flex; flex-direction: column; gap: 8px;">
          ${data.skills.map(skill => `
            <div style="display: flex; align-items: center; gap: 8px;">
               <div style="flex: 1; word-wrap: break-word;">${skill}</div>
               <div style="display: flex; gap: 4px;">
                 ${[1, 2, 3, 4, 5].map(i => `
                   <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${i <= 4 ? 'white' : 'rgba(255,255,255,0.3)'};"></div>
                 `).join('')}
               </div>
            </div>
          `).join('')}
        </div>

        ${data.personal.liveCvUrl ? `
           <div style="margin-top: auto; padding-top: 32px;">
             <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; font-size: 14px;">Live CV</h3>
             <div style="background: white; padding: 8px; border-radius: 6px; display: inline-block;">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.personal.liveCvUrl)}" width="80" height="80" />
             </div>
             <p style="font-size: 10px; margin-top: 8px; opacity: 0.9; text-align: center;">Scan voor online CV</p>
           </div>
        ` : ''}
      </div>

      <!-- Right Content (70%) -->
      <div style="width: 70%; padding: 32px; padding-top: 25mm; padding-bottom: 25mm; background: white;">
        <h1 style="font-weight: bold; font-size: 36px; margin-bottom: 8px; color: ${accentColor};">${data.personal.fullName}</h1>
        
        <div style="margin-bottom: 32px;">
          <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; font-size: 20px; color: ${accentColor};">Profiel</h3>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">${data.personal.summary}</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; font-size: 20px; color: ${accentColor};">Werkervaring</h3>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 24px;">
              <p style="font-weight: bold; color: #111827; font-size: 14px; margin-bottom: 4px;">${exp.role}</p>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                 <p style="color: #4b5563; font-size: 14px; margin: 0;">${exp.company}, ${exp.city || ''}</p>
                 <span style="color: #6b7280; font-size: 12px; font-weight: 600;">${exp.start} - ${exp.end}</span>
              </div>
              <ul style="color: #374151; list-style-type: disc; padding-left: 20px; font-size: 14px; line-height: 1.6; margin-top: 4px;">
                ${exp.description.split(/[\.\n]/).filter(s => s.trim().length > 1).map(bullet => `
                  <li style="margin-bottom: 2px;">${bullet.trim() + (/[a-zA-Z0-9]$/.test(bullet.trim()) ? '.' : '')}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        ${data.education && data.education.length > 0 ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; font-size: 20px; color: ${accentColor};">Opleidingen</h3>
            ${data.education.map(edu => `
              <div style="margin-bottom: 16px;">
                 <p style="font-weight: bold; color: #111827; margin-bottom: 0;">${edu.degree}</p>
                 <p style="color: #4b5563; font-size: 14px; margin-bottom: 0;">${edu.school}, ${edu.city || ''}</p>
                 <p style="color: #6b7280; font-size: 14px;">${edu.start} - ${edu.end}</p>
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
  options: PDFOptions = {},
  font: string = 'inter'
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

  // Generate template HTML using Fixed A4 Architecture components
  let templateHTML = '';
  switch (template) {
    case 'modern':
      // NEW: Use the unified PDF template from /components/cv-templates/
      templateHTML = renderCVModernTemplatePDF(data, accentColor, font, { showQRCode: true });
      break;
    case 'classic-sidebar':
      // LEGACY: Still using old renderer until migrated
      templateHTML = renderClassicSidebarTemplate(data, accentColor, photoBase64);
      break;
    default:
      templateHTML = renderCVModernTemplatePDF(data, accentColor, font, { showQRCode: true });
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
      ${getGoogleFontLink(font)}
      ${generatePDFStyles(accentColor, font)}
    </head>
    <body>
      ${options.customHeader ? addCustomHeader(options.customHeader) : ''}
      ${options.includeWatermark ? addWatermark(options.watermarkText || 'Cevace') : ''}
      
      <div style="width: 210mm; min-height: 297mm;">
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
