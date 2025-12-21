'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { UserRole } from '@/types/rbac';

/**
 * Check if current user is super admin
 */
async function isSuperAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'super_admin';
}

/**
 * Update a user's role (super_admin only)
 */
export async function updateUserRoleAction(
    targetUserId: string,
    newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
    try {
        // Security check: Only super_admin can update roles
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized: Only super admins can update roles' };
        }

        // Use admin client to bypass RLS
        const supabase = createAdminClient();

        // Update the role
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update role' };
    }
}

/**
 * Get all staff users (role != 'user')
 */
export async function getStaffUsersAction() {
    try {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized', data: [] };
        }

        // Use admin client to bypass RLS
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('profiles')
            .select(`
        id,
        email,
        full_name,
        role,
        created_at
      `)
            .neq('role', 'user')
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message, data: [] };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        return { success: false, error: 'Failed to fetch staff users', data: [] };
    }
}

/**
 * Search for a user by email
 */
export async function searchUserByEmailAction(email: string) {
    try {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized', data: null };
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('profiles')
            .select(`
        id,
        email,
        full_name,
        role
      `)
            .eq('email', email)
            .single();

        if (error) {
            return { success: false, error: 'User not found', data: null };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Search failed', data: null };
    }
}

/**
 * Get current user's role
 */
export async function getCurrentUserRoleAction(): Promise<UserRole | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        return profile?.role || 'user';
    } catch (error) {
        return null;
    }
}
