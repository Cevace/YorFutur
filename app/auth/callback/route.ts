import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { startTrial, getUserSubscription } from '@/lib/pricing';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Check if user already has a subscription
                const existingSubscription = await getUserSubscription(user.id);

                if (!existingSubscription) {
                    // New user! Start 7-day Executive trial
                    await startTrial(user.id);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
