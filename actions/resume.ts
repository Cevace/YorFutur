'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type TailoredResume = {
    id?: string;
    user_id?: string;
    vacancy_title: string;
    vacancy_text: string;
    rewritten_content: any;
    pdf_filename: string;
    pdf_url?: string;
    created_at?: string;
    expires_at?: string;
};

/**
 * Save a tailored resume to the database
 */
export async function saveTailoredResume(resume: TailoredResume): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const resumeData = {
            ...resume,
            user_id: user.id,
            expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
        };

        const { data, error } = await supabase
            .from('tailored_resumes')
            .insert(resumeData)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/dashboard/scanner');
        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Error saving tailored resume:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all tailored resumes for the current user
 */
export async function getTailoredResumes(): Promise<{ success: boolean; data?: TailoredResume[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data, error } = await supabase
            .from('tailored_resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('Error fetching tailored resumes:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a tailored resume
 */
export async function deleteTailoredResume(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // First, get the resume to delete the PDF from storage
        const { data: resume } = await supabase
            .from('tailored_resumes')
            .select('pdf_url')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (resume?.pdf_url) {
            // Extract filename from URL and delete from storage
            const filename = resume.pdf_url.split('/').pop();
            if (filename) {
                await supabase.storage.from('tailored-resumes').remove([`${user.id}/${filename}`]);
            }
        }

        // Delete from database
        const { error } = await supabase
            .from('tailored_resumes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/scanner');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting tailored resume:', error);
        return { success: false, error: error.message };
    }
}


