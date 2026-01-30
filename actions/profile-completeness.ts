'use server';

import { createClient } from '@/utils/supabase/server';

export type ProfileCompletenessField = {
    field: string;
    label: string;
    priority: 'required' | 'recommended';
};

export type ProfileCompleteness = {
    isComplete: boolean;
    missingFields: ProfileCompletenessField[];
    completionPercentage: number;
    hasRequiredFields: boolean;
};

/**
 * Check if user profile is complete for CV generation
 * 
 * REQUIRED (blocks CV generation):
 * - LinkedIn URL
 * - Profile Photo
 * 
 * RECOMMENDED (improves CV quality):
 * - First & Last Name
 * - Profile Summary (min 50 chars)
 * - At least 1 Experience
 * - At least 1 Education
 */
export async function checkProfileCompleteness(): Promise<ProfileCompleteness> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            isComplete: false,
            hasRequiredFields: false,
            missingFields: [],
            completionPercentage: 0
        };
    }

    const missingFields: ProfileCompletenessField[] = [];

    // Fetch profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_url, profile_photo_url, profile_summary, first_name, last_name')
        .eq('id', user.id)
        .single();

    // Check experiences
    const { data: experiences } = await supabase
        .from('profile_experiences')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

    // Check educations
    const { data: educations } = await supabase
        .from('profile_educations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

    // ========== REQUIRED FIELDS (block CV generation) ==========

    if (!profile?.linkedin_url || profile.linkedin_url.trim() === '') {
        missingFields.push({
            field: 'linkedin_url',
            label: 'LinkedIn profiel URL',
            priority: 'required'
        });
    }

    if (!profile?.profile_photo_url) {
        missingFields.push({
            field: 'profile_photo_url',
            label: 'Profielfoto',
            priority: 'required'
        });
    }

    // ========== RECOMMENDED FIELDS (improve quality) ==========

    if (!profile?.first_name || !profile?.last_name) {
        missingFields.push({
            field: 'name',
            label: 'Voor- en achternaam',
            priority: 'recommended'
        });
    }

    if (!profile?.profile_summary || profile.profile_summary.trim().length < 50) {
        missingFields.push({
            field: 'summary',
            label: 'Profiel samenvatting (min 50 karakters)',
            priority: 'recommended'
        });
    }

    if (!experiences || experiences.length === 0) {
        missingFields.push({
            field: 'experience',
            label: 'Werkervaring (minimaal 1)',
            priority: 'recommended'
        });
    }

    if (!educations || educations.length === 0) {
        missingFields.push({
            field: 'education',
            label: 'Opleiding (minimaal 1)',
            priority: 'recommended'
        });
    }

    // Calculate completion
    const requiredFields = missingFields.filter(f => f.priority === 'required');
    const totalFields = 6; // linkedin, photo, name, summary, experience, education
    const completedFields = totalFields - missingFields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return {
        isComplete: requiredFields.length === 0,
        hasRequiredFields: requiredFields.length === 0,
        missingFields,
        completionPercentage
    };
}

/**
 * Validate LinkedIn URL format
 */
export async function validateLinkedInUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    if (!url || url.trim() === '') {
        return { isValid: false, error: 'LinkedIn URL is verplicht' };
    }

    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;

    if (!linkedInRegex.test(url)) {
        return {
            isValid: false,
            error: 'Ongeldige LinkedIn URL. Moet beginnen met: https://linkedin.com/in/...'
        };
    }

    return { isValid: true };
}

/**
 * Update user's LinkedIn URL
 */
export async function updateLinkedInUrl(url: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const validation = await validateLinkedInUrl(url);

    if (!validation.isValid) {
        return { success: false, error: validation.error };
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('profiles')
            .update({ linkedin_url: url.trim() })
            .eq('id', user.id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating LinkedIn URL:', error);
        return { success: false, error: error.message };
    }
}
