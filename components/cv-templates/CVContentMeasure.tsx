'use client';

import React from 'react';
import type { CVData } from '@/actions/cv-builder';

interface ContentBlockMeasureProps {
    data: CVData;
    accentColor: string;
    font?: string;
}

/**
 * Hidden component that renders all content blocks for height measurement.
 * This is rendered off-screen and used to measure heights before pagination.
 */
export const CVContentMeasure = React.forwardRef<HTMLDivElement, ContentBlockMeasureProps>(
    function CVContentMeasure({ data, accentColor, font = 'inter' }, ref) {
        const styles = {
            container: {
                position: 'absolute' as const,
                left: '-9999px',
                top: 0,
                width: '140mm', // Content area width (66.67% of 210mm)
                visibility: 'hidden' as const,
                pointerEvents: 'none' as const,
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
        };

        return (
            <div ref={ref} style={styles.container}>
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

                {/* Profile */}
                {data.personal.summary && (
                    <div data-block-id="profile" style={{ marginBottom: '32px' }}>
                        <h3 style={styles.contentSectionTitle}>Profiel</h3>
                        <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
                            {data.personal.summary}
                        </p>
                    </div>
                )}

                {/* Experience header */}
                {data.experience && data.experience.length > 0 && (
                    <div data-block-id="experience-header">
                        <h3 style={{ ...styles.contentSectionTitle, marginBottom: '24px' }}>
                            Werkervaring
                        </h3>
                    </div>
                )}

                {/* Experience blocks */}
                {data.experience?.map((exp, index) => (
                    <div key={exp.id || index} data-block-id={`experience-${exp.id || index}`} style={styles.experienceBlock}>
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

                {/* Education header */}
                {data.education && data.education.length > 0 && (
                    <div data-block-id="education-header">
                        <h3 style={{ ...styles.contentSectionTitle, marginBottom: '24px' }}>
                            Opleidingen
                        </h3>
                    </div>
                )}

                {/* Education blocks */}
                {data.education?.map((edu, index) => (
                    <div key={edu.id || index} data-block-id={`education-${edu.id || index}`} style={styles.experienceBlock}>
                        <h4 style={styles.roleTitle}>{edu.degree}</h4>
                        <div style={styles.companyInfo}>
                            <span style={{ color: '#374151' }}>{edu.school}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span>{edu.start} - {edu.end}</span>
                        </div>
                        {edu.description && (
                            <p style={styles.description}>{edu.description}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    }
);

export default CVContentMeasure;
