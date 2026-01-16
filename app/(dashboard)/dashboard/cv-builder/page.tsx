import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import CVBuilderClient from './CVBuilderClient';
import type { CVData } from '@/lib/cv-builder/types';

export const metadata = {
    title: 'CV Builder - Cevace',
    description: 'Professionele CV builder met AI-powered text improvements en ATS scanning',
};

export default async function CVBuilderPage() {
    const supabase = await createClient();

    // Check authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile data
    const [experiencesResult, educationsResult, profileResult, skillsResult] = await Promise.all([
        supabase
            .from('profile_experiences')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false }),
        supabase
            .from('profile_educations')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false }),
        supabase
            .from('profiles')
            .select('first_name, last_name, city, phone, summary')
            .eq('id', user.id)
            .single(),
        supabase.from('profile_skills').select('skill_name').eq('user_id', user.id),
    ]);

    // Transform database data to CV Builder format
    const initialData: Partial<CVData> = {
        personal: {
            fullName: profileResult.data
                ? `${profileResult.data.first_name || ''} ${profileResult.data.last_name || ''}`.trim()
                : '',
            jobTitle: '', // Can be derived from latest experience or profile
            email: user.email || '',
            phone: profileResult.data?.phone || '',
            address: profileResult.data?.city || '',
            summary: profileResult.data?.summary || '',
        },
        experience:
            experiencesResult.data?.map((exp, index) => ({
                id: index + 1,
                role: exp.job_title || '',
                company: exp.company_name || '',
                city: exp.city || '',
                start: exp.start_date ? new Date(exp.start_date).getFullYear().toString() : '',
                end: exp.end_date ? new Date(exp.end_date).getFullYear().toString() : 'Heden',
                description: exp.description || '',
            })) || [],
        education:
            educationsResult.data?.map((edu, index) => ({
                id: index + 1,
                school: edu.institution_name || '',
                degree: edu.degree || '',
                city: edu.city || '',
                start: edu.start_date ? new Date(edu.start_date).getFullYear().toString() : '',
                end: edu.end_date ? new Date(edu.end_date).getFullYear().toString() : '',
                description: edu.description || '',
            })) || [],
        skills: skillsResult.data?.map((s) => s.skill_name) || [],
    };

    return <CVBuilderClient initialData={initialData} />;
}
