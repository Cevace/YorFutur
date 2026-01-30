/**
 * CVModernTemplate - Single Source of Truth for Modern CV Template
 * 
 * ARCHITECTURE: Matches PDF template for visual consistency
 * - Sidebar: position:absolute, only on page 1 area
 * - Sidebar background: position:fixed for full height
 * - Content: Uses margin-left to avoid sidebar
 */

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { CVData } from '@/actions/cv-builder';

// SVG Icons as inline components for PDF compatibility
const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', opacity: 0.7, flexShrink: 0 }}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', opacity: 0.7, flexShrink: 0 }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', opacity: 0.7, flexShrink: 0 }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export interface CVTemplateProps {
    data: CVData;
    accentColor: string;
    font?: string;
    showQRCode?: boolean;
}

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

export function CVModernTemplate({
    data,
    accentColor,
    font = 'inter',
    showQRCode = true
}: CVTemplateProps) {
    const fontFamily = getFontFamily(font);

    // Inline styles matching PDF template architecture
    const styles = {
        root: {
            width: '210mm',
            minHeight: '297mm',
            fontFamily,
            backgroundColor: '#ffffff',
            position: 'relative' as const,
            WebkitPrintColorAdjust: 'exact' as const,
            printColorAdjust: 'exact' as const,
        },
        // Fixed background for sidebar - extends full height
        sidebarBackground: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            bottom: 0,
            width: '70mm',
            backgroundColor: accentColor,
            zIndex: 1,
            WebkitPrintColorAdjust: 'exact' as const,
            printColorAdjust: 'exact' as const,
        },
        // Sidebar content - absolute positioned, only on "page 1"
        sidebar: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: '70mm',
            color: '#ffffff',
            padding: '20mm 5mm 20mm 15mm',
            boxSizing: 'border-box' as const,
            zIndex: 2,
        },
        // Content area - uses margin-left to avoid sidebar
        content: {
            marginLeft: '70mm',
            paddingLeft: '10mm',
            paddingRight: '15mm',
            paddingTop: '20mm',
            paddingBottom: '20mm',
            backgroundColor: '#ffffff',
            minHeight: '297mm',
        },
        name: {
            fontWeight: 700,
            fontSize: '32px',
            lineHeight: 1.1,
            marginBottom: '8px',
            wordWrap: 'break-word' as const,
        },
        jobTitle: {
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            fontSize: '14px',
            marginBottom: '32px',
        },
        contactItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            opacity: 0.9,
        },
        sectionTitle: {
            fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            paddingBottom: '12px',
            marginBottom: '16px',
            textTransform: 'uppercase' as const,
            fontSize: '16px',
            letterSpacing: '0.1em',
        },
        skillsList: {
            marginBottom: '32px',
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: 1.6,
            opacity: 0.9,
        },
        languageRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
        },
        qrContainer: {
            marginBottom: '24px',
            paddingTop: '8px',
        },
        qrBox: {
            backgroundColor: '#ffffff',
            padding: '8px',
            borderRadius: '8px',
            display: 'inline-block',
        },
        qrLabel: {
            fontSize: '10px',
            marginTop: '8px',
            color: 'rgba(255,255,255,0.8)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            fontWeight: 600,
        },
        contentSectionTitle: {
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: `2px solid ${accentColor}`,
            color: accentColor,
            fontSize: '18px',
        },
        profileText: {
            color: '#374151',
            fontSize: '15px',
            lineHeight: 1.6,
            textAlign: 'justify' as const,
        },
        experienceBlock: {
            marginBottom: '24px',
            paddingLeft: '16px',
            borderLeft: '2px solid #f3f4f6',
        },
        roleTitle: {
            fontWeight: 700,
            color: '#111827',
            fontSize: '18px',
            lineHeight: 1.2,
            marginBottom: '4px',
        },
        companyInfo: {
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
        },
        description: {
            color: '#4b5563',
            fontSize: '14px',
            lineHeight: 1.6,
        },
        educationBlock: {
            marginBottom: '24px',
            paddingLeft: '16px',
            borderLeft: '2px solid #f3f4f6',
        },
    };

    return (
        <div id="cv-render-target" style={styles.root}>
            {/* Inline styles for HTML content like bullet lists */}
            <style dangerouslySetInnerHTML={{
                __html: `
                #cv-render-target ul { list-style-type: disc; padding-left: 20px; margin: 8px 0; }
                #cv-render-target ol { list-style-type: decimal; padding-left: 20px; margin: 8px 0; }
                #cv-render-target li { margin-bottom: 4px; }
                #cv-render-target strong { font-weight: 700; }
                #cv-render-target em { font-style: italic; }
                #cv-render-target p { margin-bottom: 8px; }
            `}} />

            {/* Sidebar background - extends full height */}
            <div style={styles.sidebarBackground} />

            {/* Sidebar content - positioned at top */}
            <div style={styles.sidebar}>
                <h1 style={styles.name}>{data.personal.fullName}</h1>
                <p style={styles.jobTitle}>{data.personal.jobTitle}</p>

                {/* Contact Info */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={styles.contactItem}>
                        <MailIcon />
                        <span style={{ marginLeft: '6px' }}>{data.personal.email}</span>
                    </div>
                    <div style={styles.contactItem}>
                        <PhoneIcon />
                        <span style={{ marginLeft: '6px' }}>{data.personal.phone}</span>
                    </div>
                    <div style={styles.contactItem}>
                        <MapPinIcon />
                        <span style={{ marginLeft: '6px' }}>{data.personal.address}</span>
                    </div>
                </div>

                {/* QR Code - Positioned early to stay on page 1 */}
                {showQRCode && data.personal.liveCvUrl && (
                    <div style={styles.qrContainer}>
                        <div style={styles.qrBox}>
                            <QRCodeSVG
                                value={data.personal.liveCvUrl}
                                size={70}
                                level="M"
                            />
                        </div>
                        <p style={styles.qrLabel}>Scan voor Live CV</p>
                    </div>
                )}

                {/* Skills */}
                <h3 style={styles.sectionTitle}>Vaardigheden</h3>
                <div style={styles.skillsList}>
                    {data.skills.map((skill, i) => (
                        <span key={i}>
                            {skill}{i < data.skills.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </div>

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={styles.sectionTitle}>Talen</h3>
                        {data.languages.map((lang, i) => (
                            <div key={i} style={styles.languageRow}>
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{lang.language}</span>
                                <span style={{ fontSize: '12px', opacity: 0.7 }}>{lang.proficiency}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Content - uses margin-left to avoid sidebar */}
            <div style={styles.content}>
                {/* Profile */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={styles.contentSectionTitle}>Profiel</h3>
                    <p style={styles.profileText}>{data.personal.summary}</p>
                </div>

                {/* Work Experience */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ ...styles.contentSectionTitle, marginBottom: '24px' }}>Werkervaring</h3>
                    {data.experience.map((exp) => (
                        <div key={exp.id} style={styles.experienceBlock}>
                            <h4 style={styles.roleTitle}>{exp.role}</h4>
                            <div style={styles.companyInfo}>
                                <span style={{ color: '#374151' }}>{exp.company}</span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>{exp.start} - {exp.end}</span>
                            </div>
                            <div
                                style={styles.description}
                                dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                        </div>
                    ))}
                </div>

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ ...styles.contentSectionTitle, marginBottom: '24px' }}>Opleidingen</h3>
                        {data.education.map((edu) => (
                            <div key={edu.id} style={styles.educationBlock}>
                                <h4 style={styles.roleTitle}>{edu.degree}</h4>
                                <div style={styles.companyInfo}>
                                    {edu.school}
                                    <span style={{ margin: '0 8px' }}>•</span>
                                    {edu.start} - {edu.end}
                                </div>
                                {edu.description && (
                                    <p style={{ ...styles.description, marginTop: '4px' }}>
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CVModernTemplate;
