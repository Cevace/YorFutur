'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

export async function createBetaUser(fullName: string) {
    // 1. Verify Admin Session
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        return { success: false, error: 'Unauthorized' };
    }

    // 2. Initialize Admin Client (Service Role)
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 3. Generate Credentials
    // Format: name.surname@cevace-beta.nl (or similar, but better to use random)
    const sanitized = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    const email = `${sanitized}${randomSuffix}@beta.cevace.com`;
    const password = Math.random().toString(36).slice(-10) + "Aa1!";

    // 4. Create User
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName
        }
    });

    if (createError || !newUser.user) {
        console.error('Create user error:', createError);
        return { success: false, error: 'Failed to create user' };
    }

    // 5. Initialize Profile columns (via SQL trigger usually, but let's be safe)
    // The existing triggers should handle 'profiles' table creation.

    // 6. Assign Beta Subscription (in user_subscriptions table if exists, or Stripe metadata)
    // For V1, we just rely on them being created. If you have a subscriptions table, insert here.
    // Assuming 'profiles' table has 'is_pro' or similar? 
    // Checking previous tasks, we use Stripe logic. 
    // Ideally we grant them "PRO" access.


    // 6. Explicitly Create/Update Profile to Ensure Visibility (Fix Race Condition)
    const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
            id: newUser.user.id,
            email: email,
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ').slice(1).join(' '),
            subscription_status: 'active',
            subscription_plan: 'pro', // Beta users get PRO
            created_at: new Date().toISOString(),
            is_onboarded: true
        });

    if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'User created but profile failed: ' + profileError.message };
    }

    revalidatePath('/admin/crm');

    return {
        success: true,
        credentials: {
            email,
            password
        }
    };
}
