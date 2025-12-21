import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAudioToStream } from '@/lib/interview-coach/d-id-client';

/**
 * Send Audio to D-ID Stream
 * 1. Receives base64 audio from client
 * 2. Uploads to Supabase Storage (temp)
 * 3. Gets public URL
 * 4. Sends URL to D-ID for lip-sync
 */
export async function POST(req: NextRequest) {
    try {
        // 1. AUTH CHECK
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { streamId, sessionId, audioData } = await req.json();

        // DEBUG: Log what we received
        console.log('📩 [SEND-AUDIO] Received request:', {
            streamId,
            sessionId: sessionId?.substring(0, 50) + '...',
            audioDataLength: audioData?.length,
        });

        if (!streamId || !sessionId || !audioData) {
            console.error('❌ [SEND-AUDIO] Missing fields:', { streamId: !!streamId, sessionId: !!sessionId, audioData: !!audioData });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const apiKey = process.env.DID_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Video service not configured' }, { status: 500 });
        }

        // 2. Convert base64 to buffer
        const audioBuffer = Buffer.from(audioData, 'base64');

        // 3. SIZE CHECK - Max 5MB
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (audioBuffer.length > MAX_SIZE) {
            console.error('Audio too large:', audioBuffer.length);
            return NextResponse.json({ error: 'Audio too large (max 5MB)' }, { status: 413 });
        }

        // 4. Upload to Supabase Storage (temp bucket)
        const fileName = `temp-audio-${Date.now()}-${user.id}.mp3`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('temp-audio')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                cacheControl: '300', // 5 minutes
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
        }

        // 5. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('temp-audio')
            .getPublicUrl(fileName);

        console.log('🎤 Sending audio to D-ID:', publicUrl);

        // 6. Send to D-ID
        await sendAudioToStream(apiKey, streamId, sessionId, publicUrl);

        // 7. Cleanup - Delete immediately after D-ID has fetched it
        // Note: D-ID caches the audio, so safe to delete after fetch
        setTimeout(() => {
            supabase.storage
                .from('temp-audio')
                .remove([fileName])
                .then(() => console.log('🗑️ Temp audio cleaned up:', fileName))
                .catch(err => console.error('Cleanup error:', err));
        }, 10000); // 10 seconds delay to ensure D-ID fetched it

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('D-ID audio send error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send audio' },
            { status: 500 }
        );
    }
}
