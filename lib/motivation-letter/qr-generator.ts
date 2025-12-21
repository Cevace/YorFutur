import QRCode from 'qrcode';

/**
 * Generate QR code as data URL for Live CV link
 */
export async function generateLiveCvQRCode(liveCvUrl: string): Promise<string> {
    try {
        const dataUrl = await QRCode.toDataURL(liveCvUrl, {
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return dataUrl;
    } catch (error) {
        console.error('QR code generation failed:', error);
        throw error;
    }
}

/**
 * Get user's Live CV URL if it exists
 */
export function getUserLiveCvUrl(userId: string): string {
    // Format: https://yorfutur.nl/cv/[userId]
    return `https://yorfutur.nl/cv/${userId}`;
}
