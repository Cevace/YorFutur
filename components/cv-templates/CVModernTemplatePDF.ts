/**
 * CVModernTemplatePDF - PDF-optimized version of Modern CV Template
 * 
 * ARCHITECTURE for Word-like page flow:
 * - Sidebar BACKGROUND: position:fixed, z-index:1, extends on all pages
 * - Sidebar CONTENT: In flow, z-index:2, only appears on page 1
 * - Content: z-index:2, flows naturally across pages with 20mm padding
 * 
 * CRITICAL: The sidebar column MUST be transparent (no background-color)
 * so the fixed background behind it shows through.
 */

import type { CVData } from '@/actions/cv-builder';

// Font family mapping
const getFontFamily = (fontId: string): string => {
  const fontMap: Record<string, string> = {
    'inter': "'Inter', sans-serif",
    'roboto': "'Roboto', sans-serif",
    'open-sans': "'Open Sans', sans-serif",
    'lato': "'Lato', sans-serif",
    'merriweather': "'Merriweather', serif",
    'playfair': "'Playfair Display', serif",
    'lora': "'Lora', serif",
  };
  return fontMap[fontId] || "'Inter', sans-serif";
};

// SVG Icons as HTML strings
const ICONS = {
  mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity:0.7; flex-shrink:0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
  phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity:0.7; flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
  mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity:0.7; flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
};

export interface PDFTemplateOptions {
  showQRCode?: boolean;
}

export function renderCVModernTemplatePDF(
  data: CVData,
  accentColor: string,
  font: string = 'inter',
  options: PDFTemplateOptions = {}
): string {
  const { showQRCode = true } = options;
  const fontFamily = getFontFamily(font);

  // Generate skills as comma-separated list
  const skillsHtml = data.skills.map((skill, i) =>
    `<span>${skill}${i < data.skills.length - 1 ? ', ' : ''}</span>`
  ).join('');

  // Generate languages section
  const languagesHtml = data.languages && data.languages.length > 0 ? `
    <div style="margin-bottom: 32px;">
      <h3 style="font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 12px; margin-bottom: 16px; text-transform: uppercase; font-size: 16px; letter-spacing: 0.1em;">Talen</h3>
      ${data.languages.map(lang => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 500;">${lang.language}</span>
          <span style="font-size: 12px; opacity: 0.7;">${lang.proficiency}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Generate QR code section
  const qrCodeHtml = showQRCode && data.personal.liveCvUrl ? `
    <div style="margin-bottom: 24px; padding-top: 8px;">
      <div style="background-color: #ffffff; padding: 8px; border-radius: 8px; display: inline-block;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.personal.liveCvUrl)}" width="70" height="70" alt="QR Code" />
      </div>
      <p style="font-size: 10px; margin-top: 8px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Scan voor Live CV</p>
    </div>
  ` : '';

  // Generate experience section
  const experienceHtml = data.experience.map(exp => `
    <div style="margin-bottom: 24px; padding-left: 16px; border-left: 2px solid #f3f4f6;">
      <h4 style="font-weight: 700; color: #111827; font-size: 18px; line-height: 1.2; margin-bottom: 4px;">${exp.role}</h4>
      <div style="color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
        <span style="color: #374151;">${exp.company}</span>
        <span style="margin: 0 8px;">•</span>
        <span>${exp.start} - ${exp.end}</span>
      </div>
      <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
        ${exp.description}
      </div>
    </div>
  `).join('');

  // Generate education section
  const educationHtml = data.education && data.education.length > 0 ? `
    <div style="margin-bottom: 40px;">
      <h3 style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 2px solid ${accentColor}; color: ${accentColor}; font-size: 18px;">Opleidingen</h3>
      ${data.education.map(edu => `
        <div style="margin-bottom: 24px; padding-left: 16px; border-left: 2px solid #f3f4f6;">
          <h4 style="font-weight: 700; color: #111827; font-size: 18px; line-height: 1.2; margin-bottom: 4px;">${edu.degree}</h4>
          <div style="color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
            ${edu.school}
            <span style="margin: 0 8px;">•</span>
            ${edu.start} - ${edu.end}
          </div>
          ${edu.description ? `<p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-top: 4px;">${edu.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  // FIXED ARCHITECTURE with correct z-index layering:
  // Layer 0: Root container (no background - transparent)
  // Layer 1: Fixed sidebar background (position:fixed, z-index:1)
  // Layer 2: Flex container with sidebar content + main content (z-index:2)
  return `
    <div id="cv-render-target" style="width: 210mm; min-height: 297mm; font-family: ${fontFamily}; position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
      
      <!-- Layer 1: Fixed sidebar background - uses margin-top:-20mm to compensate for @page margin -->
      <div style="position: fixed; top: 0; left: 0; bottom: 0; width: 70mm; margin-top: -20mm; background-color: ${accentColor}; z-index: 1; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>

      <!-- Layer 2: Main flex container - z-index:2, above the fixed background -->
      <div style="display: flex; flex-direction: row; min-height: 297mm; position: relative; z-index: 2;">
        
        <!-- Left Sidebar column - uses margin-top:-20mm to compensate for @page margin -->
        <div style="width: 70mm; flex-shrink: 0; color: #ffffff; padding: 0mm 5mm 0mm 15mm; margin-top: -20mm; position: relative;">
          
          <h1 style="font-weight: 700; font-size: 32px; line-height: 1.1; margin-bottom: 8px; word-wrap: break-word;">${data.personal.fullName}</h1>
          <p style="color: rgba(255,255,255,0.8); font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin-bottom: 32px;">${data.personal.jobTitle}</p>

          <!-- Contact Info -->
          <div style="margin-bottom: 32px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; opacity: 0.9;">
              ${ICONS.mail}
              <span style="margin-left: 6px;">${data.personal.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; opacity: 0.9;">
              ${ICONS.phone}
              <span style="margin-left: 6px;">${data.personal.phone}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; opacity: 0.9;">
              ${ICONS.mapPin}
              <span style="margin-left: 6px;">${data.personal.address}</span>
            </div>
          </div>

          ${qrCodeHtml}

          <!-- Skills -->
          <h3 style="font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 12px; margin-bottom: 16px; text-transform: uppercase; font-size: 16px; letter-spacing: 0.1em;">Vaardigheden</h3>
          <div style="margin-bottom: 32px; font-size: 13px; font-weight: 500; line-height: 1.6; opacity: 0.9;">
            ${skillsHtml}
          </div>

          ${languagesHtml}
        </div>

        <!-- Right Content column - @page handles top/bottom margins, only left/right padding needed -->
        <div style="flex: 1; padding: 0mm 15mm 0mm 10mm; background-color: #ffffff;">
          
          <!-- Profile -->
          <div style="margin-bottom: 40px;">
            <h3 style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid ${accentColor}; color: ${accentColor}; font-size: 18px;">Profiel</h3>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; text-align: justify;">${data.personal.summary}</p>
          </div>

          <!-- Work Experience -->
          <div style="margin-bottom: 40px;">
            <h3 style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 2px solid ${accentColor}; color: ${accentColor}; font-size: 18px;">Werkervaring</h3>
            ${experienceHtml}
          </div>

          ${educationHtml}
        </div>
      </div>
    </div>
  `;
}

export default renderCVModernTemplatePDF;
