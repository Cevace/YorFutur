import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import CRMClient from '@/components/admin/CRMClient';

// Admin email whitelist
const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
    const supabase = createClient();

    // Security check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        redirect('/dashboard');
    }

    // Fetch all users with complete profile data using ADMIN client (Bypasses RLS)
    const adminSupabase = createAdminClient();
    const { data: users, count } = await adminSupabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    return (
        <CRMClient
            users={users || []}
            totalCount={count || 0}
        />
    );
}
