'use client';

import React from 'react';
import type { CVData } from '@/actions/cv-builder';
import type { ContentBlock, PageLayout } from '@/hooks/useCVPagination';
import { PAGE_HEIGHT_MM, PAGE_WIDTH_MM } from '@/hooks/useCVPagination';
import { QRCodeSVG } from 'qrcode.react';

// Override margins to 20mm (user preference)
const MARGIN_TOP_MM = 20;
const MARGIN_BOTTOM_MM = 20;

// Font family mapping
const fonts: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    poppins: "'Poppins', sans-serif",
    opensans: "'Open Sans', sans-serif",
    lato: "'Lato', sans-serif",
    montserrat: "'Montserrat', sans-serif",
};

const getFontFamily = (font: string) => fonts[font] || fonts.inter;

// SVG Icons (inline for PDF compatibility)
const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

interface CVModernPagedTemplateProps {
    data: CVData;
    accentColor: string;
    font?: string;
    showQRCode?: boolean;
    pageLayout: PageLayout;
    isFirstPage: boolean;
}

/**
 * Renders a single page of the Modern CV template with proper 20mm margins.
 */
export function CVModernPagedTemplate({
    data,
    accentColor,
    font = 'inter',
    showQRCode = true,
    pageLayout,
    isFirstPage
}: CVModernPagedTemplateProps) {
    const fontFamily = getFontFamily(font);

    const styles = {
        page: {
            width: `${PAGE_WIDTH_MM}mm`,
            height: `${PAGE_HEIGHT_MM}mm`,
            fontFamily,
            display: 'flex',
            flexDirection: 'row' as const,
            backgroundColor: '#ffffff',
            position: 'relative' as const,
            WebkitPrintColorAdjust: 'exact' as const,
            printColorAdjust: 'exact' as const,
        },
        sidebar: {
            width: '33.33%',
            backgroundColor: accentColor,
            color: '#ffffff',
            paddingLeft: '15mm',
            paddingRight: '5mm',
            paddingTop: `${MARGIN_TOP_MM}mm`,
            paddingBottom: `${MARGIN_BOTTOM_MM}mm`,
            display: 'flex',
            flexDirection: 'column' as const,
            WebkitPrintColorAdjust: 'exact' as const,
            printColorAdjust: 'exact' as const,
        },
        content: {
            width: '66.67%',
            backgroundColor: '#ffffff',
            paddingLeft: '10mm',
            paddingRight: '15mm',
            paddingTop: `${MARGIN_TOP_MM}mm`,
            paddingBottom: `${MARGIN_BOTTOM_MM}mm`,
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
            marginTop: 'auto',
            paddingTop: '16px',
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

    // Render a content block based on its type
    const renderBlock = (block: ContentBlock) => {
        switch (block.type) {
            case 'profile':
                return (
                    <div key={block.id} data-block-id={block.id} style={{ marginBottom: '32px' }}>
                        <h3 style={styles.contentSectionTitle}>Profiel</h3>
                        <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.6, textAlign: 'justify' as const }}>
                            {block.data.summary}
                        </p>
                    </div>
                );

            case 'section-header':
                return (
                    <div key={block.id} data-block-id={block.id}>
                        <h3 style={{ ...styles.contentSectionTitle, marginBottom: '24px' }}>
                            {block.data.title}
                        </h3>
                    </div>
                );

            case 'experience':
                return (
                    <div key={block.id} data-block-id={block.id} style={styles.experienceBlock}>
                        <h4 style={styles.roleTitle}>{block.data.role}</h4>
                        <div style={styles.companyInfo}>
                            <span style={{ color: '#374151' }}>{block.data.company}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span>{block.data.start} - {block.data.end}</span>
                        </div>
                        <div
                            style={styles.description}
                            dangerouslySetInnerHTML={{ __html: block.data.description }}
                        />
                    </div>
                );

            case 'education':
                return (
                    <div key={block.id} data-block-id={block.id} style={styles.educationBlock}>
                        <h4 style={styles.roleTitle}>{block.data.degree}</h4>
                        <div style={styles.companyInfo}>
                            <span style={{ color: '#374151' }}>{block.data.school}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span>{block.data.start} - {block.data.end}</span>
                        </div>
                        {block.data.description && (
                            <p style={styles.description}>{block.data.description}</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div style={styles.page}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                {isFirstPage ? (
                    <>
                        {/* Name and Job Title - only on first page */}
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

                        {/* QR Code - only on first page */}
                        {showQRCode && data.personal.liveCvUrl && (
                            <div style={{ marginBottom: '24px' }}>
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
                    </>
                ) : (
                    // Empty sidebar on pages 2+ (just the colored background)
                    null
                )}
            </div>

            {/* Content Area */}
            <div style={styles.content}>
                {/* Inline styles for lists */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          [data-block-id] ul { list-style-type: disc; padding-left: 20px; margin: 8px 0; }
          [data-block-id] ol { list-style-type: decimal; padding-left: 20px; margin: 8px 0; }
          [data-block-id] li { margin-bottom: 4px; }
          [data-block-id] strong { font-weight: 700; }
          [data-block-id] em { font-style: italic; }
          [data-block-id] p { margin-bottom: 8px; }
        `}} />

                {/* Render blocks for this page */}
                {pageLayout.blocks.map(block => renderBlock(block))}
            </div>
        </div>
    );
}

export default CVModernPagedTemplate;
