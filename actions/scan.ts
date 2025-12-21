'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function uploadCV(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'Geen bestand geselecteerd.' };
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Je moet ingelogd zijn om een CV te uploaden.' };
    }

    // Upload to Supabase Storage
    // Assumes a bucket named 'cvs' exists
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file);

    if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('new row violates row-level security policy') || (uploadError as any).code === '42501') {
            return { error: `Geen rechten om te uploaden. Controleer of je bent ingelogd en of de database policies correct zijn ingesteld (RLS).` };
        }
        return { error: `Kon het bestand niet uploaden: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName);

    // Save to database
    const { error: dbError } = await supabase
        .from('cvs')
        .insert({
            user_id: user.id,
            filename: file.name,
            url: publicUrl
        });

    if (dbError) {
        console.error('Database error:', dbError);
        return { error: 'Kon de CV niet opslaan in de database.' };
    }

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/cvs');

    return { success: true, url: publicUrl, fileName: file.name, storagePath: fileName };
}

export async function deleteCV(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    // First get the file URL/path to delete from storage
    const { data: cv } = await supabase
        .from('cvs')
        .select('url')
        .eq('id', id)
        .single();

    if (cv) {
        // Extract filename from URL (simplified logic, might need adjustment based on exact URL structure)
        // URL: .../storage/v1/object/public/cvs/USER_ID/TIMESTAMP.pdf
        const path = cv.url.split('/cvs/')[1];
        if (path) {
            await supabase.storage.from('cvs').remove([path]);
        }
    }

    const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
