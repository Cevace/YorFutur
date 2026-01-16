import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import CareerSpyWizard from '@/components/career-spy/CareerSpyWizard';

export const metadata = {
    title: 'Career Spy | Cevace',
    description: 'Analyseer vacatures en ontdek verborgen risico\'s voor je sollicitatie'
};

export default async function CareerSpyPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <CareerSpyWizard />;
}
