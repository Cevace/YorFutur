'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addExperience(formData: FormData) {
    const supabase = createClient();

    const jobTitle = formData.get('jobTitle') as string;
    const company = formData.get('company') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const description = formData.get('description') as string;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('work_experience')
        .insert({
            user_id: user.id,
            job_title: jobTitle,
            company: company,
            start_date: startDate,
            end_date: endDate || null,
            description: description,
        });

    if (error) {
        console.error('Error adding experience:', error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/experience');
    return { success: true };
}

export async function updateExperience(formData: FormData) {
    const supabase = createClient();

    const id = formData.get('id') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const company = formData.get('company') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const description = formData.get('description') as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('work_experience')
        .update({
            job_title: jobTitle,
            company: company,
            start_date: startDate,
            end_date: endDate || null,
            description: description,
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating experience:', error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/experience');
    return { success: true };
}

export async function deleteExperience(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/experience');
    return { success: true };
}
