'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();

        // Verify admin
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

        if (!adminUser || !ADMIN_EMAILS.includes(adminUser.email || '')) {
            return { success: false, error: 'Unauthorized' };
        }

        // Delete user's profile (cascade will handle related data)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        revalidatePath('/admin/crm');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message || 'Failed to delete user' };
    }
}

export async function updateUser(userId: string, data: {
    first_name?: string;
    last_name?: string;
    street?: string;
    house_number?: string;
    postal_code?: string;
    city?: string;
    phone?: string;
    user_role?: string;
    email?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();

        // Verify admin
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

        if (!adminUser || !ADMIN_EMAILS.includes(adminUser.email || '')) {
            return { success: false, error: 'Unauthorized' };
        }

        // Update user profile
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId);

        if (error) {
            console.error('[updateUser] Supabase error:', error);
            throw error;
        }

        revalidatePath('/admin/crm');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message || 'Failed to update user' };
    }
}
