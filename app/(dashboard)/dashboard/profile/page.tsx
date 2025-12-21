import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileEditor from '@/components/dashboard/ProfileEditor';

export default async function ProfilePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch experiences
    const { data: experiences } = await supabase
        .from('profile_experiences')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

    // Fetch educations
    const { data: educations } = await supabase
        .from('profile_educations')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

    // Fetch languages
    const { data: languages } = await supabase
        .from('profile_languages')
        .select('*')
        .eq('user_id', user.id)
        .order('language', { ascending: true });

    return (
        <ProfileEditor
            initialExperiences={experiences || []}
            initialEducations={educations || []}
            initialLanguages={languages || []}
        />
    );
}
