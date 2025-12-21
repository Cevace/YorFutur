import { NextRequest, NextResponse } from 'next/server';

/**
 * Voxtral Audio Transcription API
 * Uses Mistral's Voxtral model for high-quality Dutch transcription
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Prepare form data for Mistral API
        const mistralFormData = new FormData();
        mistralFormData.append('file', audioFile);
        mistralFormData.append('model', 'voxtral-small'); // or 'voxtral-mini' for faster processing
        mistralFormData.append('language', 'nl'); // Dutch language
        mistralFormData.append('response_format', 'json');

        // Call Mistral Voxtral API
        const response = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: mistralFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Voxtral API error:', errorText);
            throw new Error(`Voxtral API error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            text: data.text || '',
            language: data.language || 'nl',
            duration: data.duration || 0,
        });

    } catch (error: any) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: error.message || 'Transcription failed' },
            { status: 500 }
        );
    }
}
