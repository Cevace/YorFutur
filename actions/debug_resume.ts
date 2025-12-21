
import { createClient } from '@/utils/supabase/server';

export async function debugSaveResume() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('No user logged in');
        return;
    }

    console.log('User ID:', user.id);

    const testResume = {
        user_id: user.id,
        vacancy_title: 'Debug Test',
        vacancy_text: 'Debug Text',
        rewritten_content: { test: true },
        pdf_filename: 'debug.pdf',
        pdf_url: 'http://example.com/debug.pdf'
    };

    console.log('Attempting to insert:', testResume);

    const { data, error } = await supabase
        .from('tailored_resumes')
        .insert(testResume)
        .select()
        .single();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}
