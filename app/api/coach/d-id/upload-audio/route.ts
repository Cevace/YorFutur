import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/coach/d-id/upload-audio
 * Upload audio blob to Supabase storage for D-ID SDK
 * Returns public URL that can be passed to SDK speak method
 */
export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Supabase not configured');
            return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get audio from form data
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Generate unique filename
        const fileName = `sdk-audio-${Date.now()}-${crypto.randomUUID()}.mp3`;

        // Convert File to Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase storage
        const { data, error: uploadError } = await supabase.storage
            .from('temp-audio')
            .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                cacheControl: '300', // 5 minutes
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('temp-audio')
            .getPublicUrl(fileName);

        console.log('✅ Audio uploaded for SDK:', fileName);

        // Schedule cleanup after 2 minutes
        setTimeout(async () => {
            try {
                await supabase.storage.from('temp-audio').remove([fileName]);
                console.log('🗑️ SDK audio cleaned up:', fileName);
            } catch (err) {
                console.error('Cleanup error:', err);
            }
        }, 2 * 60 * 1000);

        return NextResponse.json({
            audioUrl: urlData.publicUrl,
            fileName,
        });

    } catch (error: any) {
        console.error('Audio upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
