import HeaderClient from './HeaderClient';
import { createClient } from '@/utils/supabase/server';

export default async function Header() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return <HeaderClient isLoggedIn={!!user} />;
}

// We'll define the client component in the same file for simplicity, 
// or ideally separate it. Let's separate it to keep it clean.
// Actually, for this file replacement, I'll write the Client Component in a new file 
// and import it here. But I can't create two files in one tool call easily if I want to be atomic.
// Let's make this file the Server Component and import a new Client Component.
// I'll create 'components/HeaderClient.tsx' in the next step.
// For now, I'll write the Server Component that imports HeaderClient.
