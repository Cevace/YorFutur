'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
    const supabase = createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect('/dashboard');
}

export async function signup(formData: FormData) {
    const supabase = createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const plan = formData.get('plan') as string;

    const origin = headers().get('origin');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                plan: plan,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.session) {
        redirect('/dashboard');
    }

    return { success: true, message: 'Check je email om je account te bevestigen!' };
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/');
}
