import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminContent from '@/components/admin/AdminContent';

// Admin email whitelist
const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

export default async function AdminPage() {
    const supabase = createClient();

    // Security check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        redirect('/dashboard');
    }

    // Fetch real stats
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Fetch recent users for overview
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, user_role, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <AdminContent
            user={user}
            totalUsers={totalUsers || 0}
            recentUsers={recentUsers || []}
        />
    );
}
