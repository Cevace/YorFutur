'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { differenceInDays } from 'date-fns';

export type JobApplication = {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    recruiter_name: string | null;
    application_url: string | null;
    status: 'applied' | 'response' | 'interview' | 'offer' | 'rejected';
    notes: string | null;
    deadline_date: string | null;      // Deadline voor sollicitatie
    interview_date: string | null;     // Interview/gesprek datum
    follow_up_date: string | null;     // Reminder voor follow-up
    created_at: string;
    last_updated_at: string;
};

export async function addApplication(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Niet geautoriseerd' };
    }

    const company_name = formData.get('company_name') as string;
    const job_title = formData.get('job_title') as string;
    const recruiter_name = formData.get('recruiter_name') as string || null;
    const application_url = formData.get('application_url') as string || null;
    const notes = formData.get('notes') as string || null;

    // Datum velden
    const deadline_date = formData.get('deadline_date') as string || null;
    const interview_date = formData.get('interview_date') as string || null;
    const follow_up_date = formData.get('follow_up_date') as string || null;

    if (!company_name || !job_title) {
        return { success: false, error: 'Bedrijfsnaam en functietitel zijn verplicht' };
    }

    const { data, error } = await supabase
        .from('job_applications')
        .insert({
            user_id: user.id,
            company_name,
            job_title,
            recruiter_name,
            application_url,
            notes,
            deadline_date: deadline_date || null,
            interview_date: interview_date || null,
            follow_up_date: follow_up_date || null,
            status: 'applied',
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding application:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/tracker');
    revalidatePath('/dashboard');  // Ook dashboard verversen voor agenda
    return { success: true, data };
}

export async function updateApplicationStatus(id: string, status: JobApplication['status']) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Niet geautoriseerd' };
    }

    const { error } = await supabase
        .from('job_applications')
        .update({
            status,
            last_updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating status:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/tracker');
    return { success: true };
}

export async function updateApplication(id: string, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Niet geautoriseerd' };
    }

    const company_name = formData.get('company_name') as string;
    const job_title = formData.get('job_title') as string;
    const recruiter_name = formData.get('recruiter_name') as string || null;
    const application_url = formData.get('application_url') as string || null;
    const notes = formData.get('notes') as string || null;

    // Datum velden
    const deadline_date = formData.get('deadline_date') as string || null;
    const interview_date = formData.get('interview_date') as string || null;
    const follow_up_date = formData.get('follow_up_date') as string || null;

    if (!company_name || !job_title) {
        return { success: false, error: 'Bedrijfsnaam en functietitel zijn verplicht' };
    }

    const { error } = await supabase
        .from('job_applications')
        .update({
            company_name,
            job_title,
            recruiter_name,
            application_url,
            notes,
            deadline_date: deadline_date || null,
            interview_date: interview_date || null,
            follow_up_date: follow_up_date || null,
            last_updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating application:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/tracker');
    revalidatePath('/dashboard');  // Ook dashboard verversen voor agenda
    return { success: true };
}

export async function deleteApplication(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Niet geautoriseerd' };
    }

    const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting application:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/tracker');
    return { success: true };
}
export async function getFollowUpCount(): Promise<number> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data: applications } = await supabase
        .from('job_applications')
        .select('last_updated_at, status')
        .eq('user_id', user.id)
        .eq('status', 'applied');

    if (!applications) return 0;

    // Count applications older than 7 days
    const followUpCount = applications.filter(app =>
        differenceInDays(new Date(), new Date(app.last_updated_at)) > 7
    ).length;

    return followUpCount;
}
