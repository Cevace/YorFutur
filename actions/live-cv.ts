'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// =====================================================
// TYPES
// =====================================================

export interface LiveCVLink {
    id: string;
    user_id: string;
    slug: string;
    is_active: boolean;
    views: number;
    created_at: string;
    updated_at: string;
}

export interface CVAnalytics {
    id: string;
    link_id: string;
    viewed_at: string;
    user_agent: string | null;
    country: string | null;
    referer: string | null;
}

export interface PublicProfileData {
    profile: {
        id: string;
        full_name: string;
        email: string;
        phone: string | null;
        linkedin_url: string | null;
        summary: string | null;
    };
    experiences: any[];
    educations: any[];
    languages: any[];
}

// =====================================================
// CREATE LIVE LINK
// =====================================================

/**
 * Creates a new live CV link for the authenticated user
 * Generates a unique slug based on user's name + random hash
 * 
 * @returns {object} { success: boolean, data: { slug, url } | null, error?: string }
 */
export async function createLiveLinkAction(): Promise<{
    success: boolean;
    data?: { slug: string; url: string; linkId: string };
    error?: string;
}> {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get user's profile for name
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Profile not found' };
        }

        // Generate unique slug using database function
        const baseName = profile.full_name || 'user';

        // Use admin client to call the slug generation function
        const adminSupabase = createAdminClient();
        const { data: slugData, error: slugError } = await adminSupabase
            .rpc('generate_unique_slug', { base_name: baseName });

        if (slugError || !slugData) {
            return { success: false, error: 'Failed to generate slug' };
        }

        const slug = slugData as string;

        // Create the live link
        const { data: link, error: insertError } = await supabase
            .from('live_cv_links')
            .insert({
                user_id: user.id,
                slug: slug,
                is_active: true
            })
            .select()
            .single();

        if (insertError || !link) {
            return { success: false, error: 'Failed to create link' };
        }

        // Generate full URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const url = `${baseUrl}/cv/${slug}`;

        revalidatePath('/dashboard/cv-settings');

        return {
            success: true,
            data: {
                slug: link.slug,
                url: url,
                linkId: link.id
            }
        };
    } catch (error) {
        console.error('createLiveLinkAction error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =====================================================
// TOGGLE LIVE LINK STATUS
// =====================================================

/**
 * Toggles the active status of a live CV link
 * Only the owner can toggle their own links
 * 
 * @param linkId - UUID of the live_cv_links record
 * @param isActive - New active status
 * @returns {object} { success: boolean, error?: string }
 */
export async function toggleLiveLinkAction(
    linkId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Update link (RLS ensures user owns this link)
        const { error: updateError } = await supabase
            .from('live_cv_links')
            .update({ is_active: isActive })
            .eq('id', linkId)
            .eq('user_id', user.id); // Double check ownership

        if (updateError) {
            return { success: false, error: 'Failed to update link' };
        }

        revalidatePath('/dashboard/cv-settings');

        return { success: true };
    } catch (error) {
        console.error('toggleLiveLinkAction error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =====================================================
// TRACK VIEW & RETURN PROFILE DATA
// =====================================================

/**
 * Tracks a view for a live CV link and returns the full profile data
 * This is called when someone visits /cv/[slug]
 * 
 * @param slug - The unique slug from the URL
 * @param userAgent - Browser user agent string
 * @param referer - Optional referer URL
 * @returns {object} { success: boolean, data: PublicProfileData | null, error?: string }
 */
export async function trackViewAction(
    slug: string,
    userAgent?: string,
    referer?: string
): Promise<{
    success: boolean;
    data?: PublicProfileData;
    error?: string;
}> {
    try {
        console.log('[trackViewAction] Starting with slug:', slug);

        // Use admin client to bypass RLS for analytics insert
        const adminSupabase = createAdminClient();

        // Find the link by slug (must be active)
        const { data: link, error: linkError } = await adminSupabase
            .from('live_cv_links')
            .select('id, user_id, is_active, views')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        console.log('[trackViewAction] Link query result:', { link, linkError });

        if (linkError || !link) {
            console.error('[trackViewAction] Link not found:', linkError);
            return { success: false, error: 'Link not found or inactive' };
        }

        // Increment view counter
        const { error: updateError } = await adminSupabase
            .from('live_cv_links')
            .update({ views: link.views + 1 })
            .eq('id', link.id);

        if (updateError) {
            console.error('Failed to increment views:', updateError);
        }

        // Insert analytics record
        const { error: analyticsError } = await adminSupabase
            .from('cv_analytics')
            .insert({
                link_id: link.id,
                user_agent: userAgent || null,
                country: null,
                referer: referer || null
            });

        if (analyticsError) {
            console.error('Failed to insert analytics:', analyticsError);
        }

        // Fetch full profile data
        const publicSupabase = createAdminClient();

        const { data: profile, error: profileError } = await publicSupabase
            .from('profiles')
            .select('id, full_name, email, phone, linkedin_url, summary')
            .eq('id', link.user_id)
            .single();

        console.log('[trackViewAction] Profile query result:', { profile, profileError });

        if (profileError || !profile) {
            console.error('[trackViewAction] Profile not found:', profileError);
            return { success: false, error: 'Profile not found' };
        }

        // Fetch experiences
        const { data: experiences } = await publicSupabase
            .from('profile_experiences')
            .select('*')
            .eq('user_id', link.user_id)
            .order('start_date', { ascending: false });

        // Fetch educations
        const { data: educations } = await publicSupabase
            .from('profile_educations')
            .select('*')
            .eq('user_id', link.user_id)
            .order('start_date', { ascending: false });

        // Fetch languages
        const { data: languages } = await publicSupabase
            .from('profile_languages')
            .select('*')
            .eq('user_id', link.user_id);

        console.log('[trackViewAction] Data fetched:', {
            experiencesCount: experiences?.length,
            educationsCount: educations?.length,
            languagesCount: languages?.length
        });

        return {
            success: true,
            data: {
                profile: {
                    id: profile.id,
                    full_name: profile.full_name,
                    email: profile.email,
                    phone: profile.phone,
                    linkedin_url: profile.linkedin_url,
                    summary: profile.summary
                },
                experiences: experiences || [],
                educations: educations || [],
                languages: languages || []
            }
        };
    } catch (error) {
        console.error('trackViewAction error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =====================================================
// GET USER'S LIVE LINKS
// =====================================================

/**
 * Fetches all live CV links for the authenticated user
 * 
 * @returns {object} { success: boolean, data: LiveCVLink[] | null, error?: string }
 */
export async function getUserLiveLinksAction(): Promise<{
    success: boolean;
    data?: LiveCVLink[];
    error?: string;
}> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data: links, error: fetchError } = await supabase
            .from('live_cv_links')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (fetchError) {
            return { success: false, error: 'Failed to fetch links' };
        }

        return { success: true, data: links || [] };
    } catch (error) {
        console.error('getUserLiveLinksAction error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// =====================================================
// DELETE LIVE LINK
// =====================================================

/**
 * Deletes a live CV link
 * Only the owner can delete their own links
 * 
 * @param linkId - UUID of the live_cv_links record
 * @returns {object} { success: boolean, error?: string }
 */
export async function deleteLiveLinkAction(
    linkId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error: deleteError } = await supabase
            .from('live_cv_links')
            .delete()
            .eq('id', linkId)
            .eq('user_id', user.id);

        if (deleteError) {
            return { success: false, error: 'Failed to delete link' };
        }

        revalidatePath('/dashboard/cv-settings');

        return { success: true };
    } catch (error) {
        console.error('deleteLiveLinkAction error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
