import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import EditUserForm from '@/components/admin/EditUserForm';

// Admin email whitelist
const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

export default async function EditUserPage({ params }: { params: { userId: string } }) {
    const supabase = createClient();

    // Security check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        redirect('/dashboard');
    }

    // Fetch user data
    const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.userId)
        .single();

    if (error || !userData) {
        redirect('/admin/crm');
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-4xl mx-auto">
                <EditUserForm user={userData} />
            </div>
        </div>
    );
}
