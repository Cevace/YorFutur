import { createClient } from '@/utils/supabase/server';
import TrackerClient from '@/components/dashboard/TrackerClient';
import { JobApplication } from '@/actions/tracker';

export default async function TrackerPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Niet geautoriseerd</div>;
    }

    const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return <TrackerClient applications={(applications as JobApplication[]) || []} />;
}
