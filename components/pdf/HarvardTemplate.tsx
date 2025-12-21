
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Harvard-style PDF template: Black & White, Serif, Professional, Dense
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
        paddingTop: 85,        // 3cm = ~85pt
        paddingBottom: 40,
        paddingLeft: 71,       // 2.5cm = ~71pt
        paddingRight: 71,      // 2.5cm = ~71pt
        fontFamily: 'Times-Roman',
        fontSize: 11,
        lineHeight: 1.4,
    },
    header: {
        marginBottom: 20,
        borderBottom: '2pt solid #000000',
        paddingBottom: 10,
    },
    name: {
        fontSize: 24,
        fontFamily: 'Times-Bold',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contactInfo: {
        fontSize: 10,
        color: '#333333',
        marginTop: 4,
    },
    section: {
        marginTop: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Times-Bold',
        textTransform: 'uppercase',
        borderBottom: '1pt solid #000000',
        paddingBottom: 3,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    summary: {
        fontSize: 11,
        marginBottom: 12,
        textAlign: 'justify',
        lineHeight: 1.5,
    },
    experienceItem: {
        marginBottom: 12,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    jobTitle: {
        fontSize: 12,
        fontFamily: 'Times-Bold',
    },
    company: {
        fontSize: 11,
        fontFamily: 'Times-Italic',
        marginBottom: 2,
    },
    dates: {
        fontSize: 10,
        color: '#333333',
    },
    description: {
        fontSize: 10,
        marginTop: 4,
        marginBottom: 4,
        textAlign: 'justify',
        lineHeight: 1.4,
    },
    skills: {
        fontSize: 10,
        marginTop: 4,
        fontFamily: 'Times-Italic',
    },
    educationItem: {
        marginBottom: 10,
    },
    degree: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
        marginBottom: 2,
    },
    school: {
        fontSize: 10,
        fontFamily: 'Times-Italic',
    },
    aiSuggestion: {
        color: '#666666',
        fontSize: 9,
        fontFamily: 'Times-Italic',
    },
    dataNeeded: {
        color: '#999999',
        fontSize: 9,
        fontFamily: 'Times-Italic',
    },
    qrSection: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 10,
        borderTop: '1pt solid #CCCCCC',
    },
    qrCode: {
        width: 50,
        height: 50,
    },
    qrText: {
        fontSize: 8,
        color: '#666666',
    },
});

type HarvardTemplateProps = {
    data: {
        personal: {
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
        };
        summary?: string;
        experiences: Array<{
            company: string;
            job_title: string;
            location?: string;
            start_date?: string;
            end_date?: string;
            is_current?: boolean;
            description?: string;
            skills?: string[];
        }>;
        educations: Array<{
            school: string;
            degree?: string;
            field_of_study?: string;
            start_date?: string;
            end_date?: string;
        }>;
        languages?: Array<{
            language: string;
            proficiency: string;
        }>;
        liveCvUrl?: string;      // Live CV link
        qrCodeDataUrl?: string;  // QR code as data URL
    };
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short' });
};

// Helper to safely convert value to string
const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        // If it's an object, stringify it for debugging
        console.warn('Unexpected object in PDF data:', value);
        return JSON.stringify(value);
    }
    return String(value);
};

// Helper to render description with bullet points
const renderDescription = (description: any) => {
    const descString = safeString(description);
    if (!descString) return null;

    // Split on newlines and render each line separately
    const lines = descString.split('\n').filter(line => line.trim());
    return lines.map((line, idx) => (
        <Text key={idx} style={styles.description}>
            {line.trim()}
        </Text>
    ));
};

const HarvardTemplate: React.FC<HarvardTemplateProps> = ({ data }) => {
    const { personal, summary, experiences, educations, languages, liveCvUrl, qrCodeDataUrl } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>
                        {safeString(personal.first_name)} {safeString(personal.last_name)}
                    </Text>
                    <Text style={styles.contactInfo}>
                        {safeString(personal.email)} | {safeString(personal.phone)}
                    </Text>
                </View>

                {/* Summary */}
                {summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summary}>{safeString(summary)}</Text>
                    </View>
                )}

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Experience</Text>
                    {experiences.map((exp, index) => (
                        <View key={index} style={styles.experienceItem}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>
                                    {safeString(exp.job_title)}
                                    {safeString(exp.job_title).includes('[Cevace suggestie:') && (
                                        <Text style={styles.aiSuggestion}> (Cevace suggestie)</Text>
                                    )}
                                </Text>
                                <Text style={styles.dates}>
                                    {formatDate(exp.start_date)} - {exp.is_current ? 'Heden' : formatDate(exp.end_date)}
                                </Text>
                            </View>
                            <Text style={styles.company}>
                                {safeString(exp.company)}{exp.location ? `, ${safeString(exp.location)}` : ''}
                            </Text>
                            {exp.description && (
                                <View>
                                    {renderDescription(exp.description)}
                                </View>
                            )}
                            {exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0 && (
                                <Text style={styles.skills}>
                                    Key Skills: {exp.skills.map(s => safeString(s)).join(', ')}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Education */}
                {educations && educations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {educations.map((edu, index) => (
                            <View key={index} style={styles.educationItem}>
                                <Text style={styles.degree}>
                                    {safeString(edu.degree)}{edu.field_of_study ? ` - ${safeString(edu.field_of_study)}` : ''}
                                </Text>
                                <Text style={styles.school}>{safeString(edu.school)}</Text>
                                {(edu.start_date || edu.end_date) && (
                                    <Text style={styles.dates}>
                                        {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        {languages.map((lang, index) => (
                            <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
                                <Text style={{ fontSize: 10, width: 100, fontFamily: 'Times-Bold' }}>
                                    {safeString(lang.language)}:
                                </Text>
                                <Text style={{ fontSize: 10 }}>
                                    {safeString(lang.proficiency)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Live CV QR Code */}
                {qrCodeDataUrl && liveCvUrl && (
                    <View style={styles.qrSection}>
                        <Image src={qrCodeDataUrl} style={styles.qrCode} />
                        <View>
                            <Text style={styles.qrText}>Scan for my Live CV</Text>
                            <Text style={styles.qrText}>{liveCvUrl}</Text>
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default HarvardTemplate;
