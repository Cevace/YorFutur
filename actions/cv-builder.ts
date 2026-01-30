'use server';

import { createClient } from '@/utils/supabase/server';
import { getContactInfo, getExperiences, getEducations } from '@/actions/profile';

export type CVData = {
    personal: {
        fullName: string;
        jobTitle: string;
        email: string;
        phone: string;
        address: string;
        summary: string;
        liveCvUrl: string;
        profilePhotoUrl?: string;
    };
    experience: Array<{
        id: number;
        role: string;
        company: string;
        city: string;
        start: string;
        end: string;
        description: string;
    }>;
    education: Array<{
        id: number;
        school: string;
        degree: string;
        city: string;
        start: string;
        end: string;
        description: string;
    }>;
    skills: string[];
    languages: Array<{
        language: string;
        proficiency: string;
    }>;
};

/**
 * Format date from ISO to month + year format (e.g., 'jan 2024')
 */
function formatDate(dateString?: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Dutch month abbreviations
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
}

/**
 * Default CV data for users without profile
 */
function getDefaultCVData(): CVData {
    return {
        personal: {
            fullName: "Jouw Naam",
            jobTitle: "Jouw Functie",
            email: "email@voorbeeld.nl",
            phone: "06-12345678",
            address: "Stad",
            summary: "Je profiel beschrijving hier...",
            liveCvUrl: ""
        },
        experience: [{
            id: 1,
            role: "Functie",
            company: "Bedrijf",
            city: "Stad",
            start: "2020",
            end: "Heden",
            description: "Beschrijving van je werkzaamheden..."
        }],
        education: [{
            id: 1,
            school: "School/Universiteit",
            degree: "Opleiding",
            city: "",
            start: "2015",
            end: "2018",
            description: ""
        }],
        skills: ["Vaardigheid 1", "Vaardigheid 2", "Vaardigheid 3"],
        languages: []
    };
}

/**
 * Fetch user languages from profile_languages table
 */
async function getLanguages() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [], error: null };

    return await supabase
        .from('profile_languages')
        .select('language, proficiency')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
}

/**
 * Generate a slug from a string (lowercase, hyphens, alphanumeric only)
 */
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique Live CV URL for user
 * Format: https://cevace.com/cv/{user_id}/{name-slug}
 */
function generateLiveCvUrl(userId: string, fullName: string): string {
    const nameSlug = generateSlug(fullName);
    const shortId = userId.substring(0, 8); // First 8 chars of UUID for readability
    return `https://cv.cevace.com/${shortId}/${nameSlug}`;
}

/**
 * Fetch user profile data and map to CV format
 */
export async function getCVData(): Promise<CVData> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Parallel fetch for better performance
        const [contactResult, experiencesResult, educationsResult, languagesResult, profileResult] = await Promise.all([
            getContactInfo(),
            getExperiences(),
            getEducations(),
            getLanguages(),
            supabase.from('profiles').select('profile_photo_url, profile_summary').eq('id', user.id).single()
        ]);

        // Extract data with fallbacks
        const contact = contactResult.data || {};
        const experiences = experiencesResult.data || [];
        const educations = educationsResult.data || [];
        const languages = languagesResult.data || [];
        const profile = profileResult.data as { profile_photo_url?: string | null; profile_summary?: string | null } || {};

        // Generate full name
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Jouw Naam';

        // Generate unique Live CV URL
        const liveCvUrl = generateLiveCvUrl(user.id, fullName);

        // Get profile photo URL and convert to public URL if exists
        let profilePhotoUrl: string | undefined;
        if (profile.profile_photo_url) {
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(profile.profile_photo_url);
            profilePhotoUrl = publicUrl;
        }

        // Map database format to CV format
        return {
            personal: {
                fullName,
                jobTitle: experiences[0]?.job_title || 'Jouw Functie',
                email: contact.email || 'email@voorbeeld.nl',
                phone: contact.phone || '06-12345678',
                address: contact.city ? `${contact.city}${contact.country ? ', ' + contact.country : ''}` : 'Stad',
                summary: profile.profile_summary || '', // From profile editor
                liveCvUrl, // Auto-generated unique URL
                profilePhotoUrl
            },
            experience: experiences.map((exp, index) => ({
                id: index + 1,
                role: exp.job_title || 'Functie',
                company: exp.company || 'Bedrijf',
                city: exp.location || '',
                start: formatDate(exp.start_date),
                end: exp.is_current ? 'Heden' : formatDate(exp.end_date),
                description: exp.description || ''
            })),
            education: educations.map((edu, index) => ({
                id: index + 1,
                school: edu.school || 'School',
                degree: edu.degree || edu.field_of_study || 'Opleiding',
                city: '',
                start: formatDate(edu.start_date),
                end: formatDate(edu.end_date),
                description: edu.field_of_study && edu.degree ? '' : (edu.field_of_study || edu.degree || '')
            })),
            skills: experiences.length > 0
                ? experiences.flatMap(exp => exp.skills || []).filter((v, i, a) => a.indexOf(v) === i) // Unique skills
                : ['Vaardigheid 1', 'Vaardigheid 2', 'Vaardigheid 3'],
            languages: languages.map(lang => ({
                language: lang.language,
                proficiency: lang.proficiency
            }))
        };
    } catch (error) {
        console.error('Error fetching CV data:', error);
        // Return sensible defaults
        return getDefaultCVData();
    }
}

/**
 * Get user's CV settings (template choice and accent color)
 */
export async function getUserCVSettings() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                data: null,
                error: 'User not authenticated'
            };
        }

        const { data, error } = await supabase
            .from('cv_settings')
            .select('template_id, accent_color')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching CV settings:', error);
            return { data: null, error: error.message };
        }

        // Return defaults if no settings exist
        if (!data) {
            return {
                data: {
                    template_id: 'modern',
                    accent_color: '#2563eb'
                },
                error: null
            };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error in getUserCVSettings:', error);
        return {
            data: {
                template_id: 'modern',
                accent_color: '#2563eb'
            },
            error: null
        };
    }
}

/**
 * Save user's CV settings (template choice and accent color)
 */
export async function saveUserCVSettings(templateId: string, accentColor: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Upsert: insert if doesn't exist, update if exists
        const { error } = await supabase
            .from('cv_settings')
            .upsert({
                user_id: user.id,
                template_id: templateId,
                accent_color: accentColor,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Error saving CV settings:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error in saveUserCVSettings:', error);
        return { success: false, error: 'Failed to save settings' };
    }
}

