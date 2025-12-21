import Navbar from './Navbar';
import { createClient } from '@/utils/supabase/server';

interface NavbarWrapperProps {
    theme?: 'dark' | 'light';
}

export default async function NavbarWrapper({ theme = 'light' }: NavbarWrapperProps) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return <Navbar theme={theme} isLoggedIn={!!user} />;
}
