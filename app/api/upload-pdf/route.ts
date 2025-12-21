import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const filename = formData.get('filename') as string;

        if (!file || !filename) {
            return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
        }

        // Convert File to ArrayBuffer then to Blob
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

        const filePath = `${user.id}/${filename}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
            .from('tailored-resumes')
            .upload(filePath, blob, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('tailored-resumes')
            .getPublicUrl(filePath);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: any) {
        console.error('Upload PDF error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
