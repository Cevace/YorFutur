'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ===== EXISTING PROFILE UPDATE =====
export async function updateProfile(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const postalCode = formData.get('postalCode') as string;
    const city = formData.get('city') as string;

    const { error } = await supabase
        .from('profiles')
        .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            address: address,
            postal_code: postalCode,
            city: city,
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/account');
    return { success: true };
}

// ===== NEW: CEVACE PROFILE ENGINE =====

// Types for profile data
export type Experience = {
    id?: string;
    user_id?: string;
    company: string;
    job_title: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    skills: string[];
};

export type Education = {
    id?: string;
    user_id?: string;
    school: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
};

export type Language = {
    id?: string;
    user_id?: string;
    language: string;
    proficiency: string;
};

export type ContactInfo = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    linkedin_url?: string;
};

export type ParsedProfileData = {
    contact?: ContactInfo;
    summary?: string;
    experiences: Experience[];
    educations: Education[];
    languages?: Language[];
};

/**
 * Check if user has existing profile data
 */
export async function hasProfileData(): Promise<boolean> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        // Check if user has any experiences
        const { data: experiences } = await supabase
            .from('profile_experiences')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        // Check if user has any educations
        const { data: educations } = await supabase
            .from('profile_educations')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        // Check if user has any languages
        const { data: languages } = await supabase
            .from('profile_languages')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        return ((experiences && experiences.length > 0) ||
            (educations && educations.length > 0) ||
            (languages && languages.length > 0)) ?? false;
    } catch (error) {
        console.error('Error checking profile data:', error);
        return false;
    }
}

/**
 * Fetch all experiences for the current user
 */
export async function getExperiences(): Promise<{ success: boolean; data?: Experience[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data, error } = await supabase
            .from('profile_experiences')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('Error fetching experiences:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch all educations for the current user
 */
export async function getEducations(): Promise<{ success: boolean; data?: Education[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data, error } = await supabase
            .from('profile_educations')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('Error fetching educations:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update or create an experience
 */
export async function upsertExperience(experience: Experience): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const experienceData = {
            ...experience,
            user_id: user.id,
            skills: experience.skills || []
        };

        const { error } = experience.id
            ? await supabase.from('profile_experiences').update(experienceData).eq('id', experience.id)
            : await supabase.from('profile_experiences').insert(experienceData);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error upserting experience:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an experience
 */
export async function deleteExperience(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('profile_experiences')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting experience:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update or create an education
 */
export async function upsertEducation(education: Education): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const educationData = {
            ...education,
            user_id: user.id
        };

        const { error } = education.id
            ? await supabase.from('profile_educations').update(educationData).eq('id', education.id)
            : await supabase.from('profile_educations').insert(educationData);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error upserting education:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an education
 */
export async function deleteEducation(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('profile_educations')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting education:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Overwrite all profile data (called after CV parse)
 * DELETES existing experiences and educations, then inserts new parsed data
 */
export async function overwriteProfileData(profileData: ParsedProfileData): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Step 1: UPDATE profiles table with contact info and summary
        if (profileData.contact || profileData.summary) {
            const profileUpdate: any = {};

            if (profileData.contact) {
                if (profileData.contact.first_name) profileUpdate.first_name = profileData.contact.first_name;
                if (profileData.contact.last_name) profileUpdate.last_name = profileData.contact.last_name;
                if (profileData.contact.phone) profileUpdate.phone = profileData.contact.phone;
                if (profileData.contact.city) profileUpdate.city = profileData.contact.city;
                if (profileData.contact.country) profileUpdate.country = profileData.contact.country;
                if (profileData.contact.linkedin_url) profileUpdate.linkedin_url = profileData.contact.linkedin_url;
            }

            if (profileData.summary) {
                profileUpdate.summary = profileData.summary;
            }

            if (Object.keys(profileUpdate).length > 0) {
                const { error: updateProfileError } = await supabase
                    .from('profiles')
                    .update(profileUpdate)
                    .eq('id', user.id);

                if (updateProfileError) throw updateProfileError;
            }
        }

        // Step 2: DELETE all existing experiences, educations, and languages
        const { error: deleteExpError } = await supabase
            .from('profile_experiences')
            .delete()
            .eq('user_id', user.id);

        if (deleteExpError) throw deleteExpError;

        const { error: deleteEduError } = await supabase
            .from('profile_educations')
            .delete()
            .eq('user_id', user.id);

        if (deleteEduError) throw deleteEduError;

        const { error: deleteLangError } = await supabase
            .from('profile_languages')
            .delete()
            .eq('user_id', user.id);

        if (deleteLangError) throw deleteLangError;

        // Step 3: INSERT new experiences
        if (profileData.experiences.length > 0) {
            const experiencesWithUserId = profileData.experiences.map(exp => ({
                ...exp,
                user_id: user.id,
                skills: exp.skills || []
            }));

            const { error: insertExpError } = await supabase
                .from('profile_experiences')
                .insert(experiencesWithUserId);

            if (insertExpError) throw insertExpError;
        }

        // Step 4: INSERT new educations
        if (profileData.educations.length > 0) {
            const educationsWithUserId = profileData.educations.map(edu => ({
                ...edu,
                user_id: user.id
            }));

            const { error: insertEduError } = await supabase
                .from('profile_educations')
                .insert(educationsWithUserId);

            if (insertEduError) throw insertEduError;
        }

        // Step 5: INSERT new languages
        if (profileData.languages && profileData.languages.length > 0) {
            const languagesWithUserId = profileData.languages.map(lang => ({
                language: lang.language,
                proficiency: lang.proficiency,
                user_id: user.id
            }));

            const { error: insertLangError } = await supabase
                .from('profile_languages')
                .insert(languagesWithUserId);

            if (insertLangError) throw insertLangError;
        }

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error overwriting profile data:', error);
        return { success: false, error: error.message };
    }
}

// ===== LANGUAGE ACTIONS =====

/**
 * Fetch all languages for the current user
 */
export async function getLanguages(): Promise<{ success: boolean; data?: Language[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data, error } = await supabase
            .from('profile_languages')
            .select('*')
            .eq('user_id', user.id)
            .order('language', { ascending: true });

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('Error fetching languages:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a new language
 */
export async function addLanguage(language: Language): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('profile_languages')
            .insert({
                language: language.language,
                proficiency: language.proficiency,
                user_id: user.id
            });

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error adding language:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing language
 */
export async function updateLanguage(id: string, language: Language): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('profile_languages')
            .update({
                language: language.language,
                proficiency: language.proficiency
            })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating language:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a language
 */
export async function deleteLanguage(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('profile_languages')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting language:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user contact info for NAW fields
 */
export async function getContactInfo(): Promise<{ success: boolean; data?: ContactInfo; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone, city, country, linkedin_url')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return {
            success: true,
            data: {
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: user.email || '', // Get from auth
                phone: data.phone || '',
                city: data.city || '',
                country: data.country || '',
                linkedin_url: data.linkedin_url || ''
            }
        };
    } catch (error: any) {
        console.error('Error fetching contact info:', error);
        return { success: false, error: error.message };
    }
}
