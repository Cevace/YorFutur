'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    Application,
    ApplicationStatus,
    IntelligenceStatus,
    ApplicationWithSessions
} from '@/lib/interview-coach/types';

/**
 * Get all applications for the current user
 */
export async function getApplications(): Promise<Application[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get a single application by ID with sessions
 */
export async function getApplication(id: string): Promise<ApplicationWithSessions | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      sessions:interview_sessions(*)
    `)
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

/**
 * Create a new application
 */
export async function createApplication(input: {
    company_name: string;
    job_title: string;
    vacancy_text?: string;
    cv_snapshot?: string;
}): Promise<{ success: boolean; data?: Application; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // TEMPORARY: Mock company intelligence for testing (until Phase 2 implemented)
    const mockCultureSummary = `${input.company_name} is een moderne organisatie met focus op innovatie en samenwerking. De cultuur is informeel en resultaatgericht, met ruimte voor professionele ontwikkeling.`;
    const mockRecentNews = `${input.company_name} heeft recent nieuwe producten gelanceerd en investeert in AI-technologie. Het bedrijf is aan het groeien en werft actief nieuwe talenten.`;

    const { data, error } = await supabase
        .from('applications')
        .insert({
            user_id: user.id,
            ...input,
            // TODO: Change to 'pending' when Phase 2 (Tavily API) is implemented
            intelligence_status: 'complete' as IntelligenceStatus,
            company_culture_summary: mockCultureSummary,
            recent_company_news: mockRecentNews,
            status: 'preparation' as ApplicationStatus
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // TODO: Uncomment when Phase 2 is implemented
    // Trigger company research (async - don't wait)
    // if (data) {
    //   triggerCompanyResearch(data.id).catch(console.error);
    // }

    revalidatePath('/coach');
    return { success: true, data };
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
    id: string,
    status: ApplicationStatus
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/coach');
    return { success: true };
}

/**
 * Update application company intelligence data
 */
export async function updateApplicationIntelligence(
    id: string,
    data: {
        company_culture_summary?: string;
        recent_company_news?: string;
        intelligence_status: IntelligenceStatus;
    }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('applications')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/coach');
    return { success: true };
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/coach');
    return { success: true };
}

/**
 * Trigger company research (async background job)
 * This will eventually call a Supabase Edge Function
 */
async function triggerCompanyResearch(applicationId: string): Promise<void> {
    // TODO: Implement Edge Function call
    // For now, just update status to 'researching'
    const supabase = await createClient();

    await supabase
        .from('applications')
        .update({
            intelligence_status: 'researching' as IntelligenceStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

    // In Phase 2, this will call:
    // await supabase.functions.invoke('enrich-company', {
    //   body: { applicationId }
    // })
}
