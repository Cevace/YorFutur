'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Professional Dutch letter: Helvetica (sans-serif), official margins, QR code
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
        paddingTop: 98,        // 3.5cm = ~98pt (was 70pt/2.5cm, added 1cm)
        paddingBottom: 28,     // 1cm = ~28pt
        paddingLeft: 85,       // 3cm = ~85pt
        paddingRight: 85,      // 3cm = ~85pt
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.6,
    },
    companySection: {
        marginBottom: 15,
    },
    companyName: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    companyLine: {
        fontSize: 11,
        marginBottom: 1,
    },
    dateLine: {
        fontSize: 11,
        marginBottom: 20,
    },
    letterContent: {
        fontSize: 11,
        textAlign: 'justify',
        lineHeight: 1.6,
        marginBottom: 10,
    },
    closing: {
        marginTop: 8,          // REDUCED from 15 to 8 (extra regel eruit)
        marginBottom: 0,
    },
    closingText: {
        fontSize: 11,
        marginBottom: 10,
    },
    signatureName: {
        fontSize: 11,
        fontFamily: 'Helvetica',
        marginBottom: 5,       // REDUCED from 10 to 5 (50% smaller)
    },
    userAddress: {
        fontSize: 10,
        color: '#333333',
        marginBottom: 0.5,     // REDUCED from 1 to 0.5 (50% smaller)
    },
    qrSection: {
        marginTop: 36,         // ~1.3cm (was 8pt, added ~1cm more)
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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

type MotivationLetterPDFProps = {
    data: {
        // Candidate info
        candidateName: string;
        candidateEmail: string;
        candidatePhone?: string;
        candidateAddress?: string;
        candidateCity?: string; // NEW: for date format

        // Company info
        companyName?: string;
        contactPerson?: string;
        companyAddress?: string;

        // Letter content
        letterContent: string;
        selectedDate: Date;
        liveCvUrl?: string;      // NEW: Live CV link
        qrCodeDataUrl?: string;  // NEW: QR code as data URL
    };
};

const formatDate = (date: Date, city?: string) => {
    const dutchDate = date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Format: "Amsterdam, 1 december 2025"
    return city ? `${city}, ${dutchDate}` : dutchDate;
};

const MotivationLetterPDF: React.FC<MotivationLetterPDFProps> = ({ data }) => {
    const {
        candidateName,
        candidateEmail,
        candidatePhone,
        candidateAddress,
        candidateCity,
        companyName,
        contactPerson,
        companyAddress,
        letterContent,
        selectedDate,
        liveCvUrl,
        qrCodeDataUrl
    } = data;

    const paragraphs = letterContent.split('\n\n').filter(p => p.trim());

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Company Info at TOP */}
                {(companyName || contactPerson || companyAddress) && (
                    <View style={styles.companySection}>
                        {companyName && (
                            <Text style={styles.companyName}>{companyName}</Text>
                        )}
                        {contactPerson && (
                            <Text style={styles.companyLine}>T.a.v. {contactPerson}</Text>
                        )}
                        {companyAddress && (
                            <Text style={styles.companyLine}>{companyAddress}</Text>
                        )}
                    </View>
                )}

                {/* Date with City */}
                <Text style={styles.dateLine}>{formatDate(selectedDate, candidateCity)}</Text>

                {/* Letter Body */}
                {paragraphs.map((paragraph, index) => (
                    <Text key={index} style={styles.letterContent}>
                        {paragraph.trim()}
                    </Text>
                ))}

                {/* Closing */}
                <View style={styles.closing}>
                    <Text style={styles.closingText}>Met vriendelijke groet,</Text>
                </View>

                {/* User Info at BOTTOM */}
                <View>
                    <Text style={styles.signatureName}>{candidateName}</Text>
                    {candidateAddress && (
                        <Text style={styles.userAddress}>{candidateAddress}</Text>
                    )}
                    {candidateCity && (
                        <Text style={styles.userAddress}>{candidateCity}</Text>
                    )}
                    <Text style={styles.userAddress}>
                        {candidateEmail}{candidatePhone ? ` | ${candidatePhone}` : ''}
                    </Text>
                </View>

                {/* Live CV QR Code */}
                {qrCodeDataUrl && liveCvUrl && (
                    <View style={styles.qrSection}>
                        <Image src={qrCodeDataUrl} style={styles.qrCode} />
                        <View>
                            <Text style={styles.qrText}>Scan voor mijn Live CV</Text>
                            <Text style={styles.qrText}>{liveCvUrl}</Text>
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default MotivationLetterPDF;
