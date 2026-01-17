import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

// Admin email whitelist
const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

export default async function AdminPage() {
    const supabase = createClient();

    // Security check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        redirect('/dashboard');
    }

    // Redirect to the new CRM interface
    redirect('/admin/crm');
}
