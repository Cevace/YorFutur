import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const subscription = await request.json();
    const supabase = createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subscription || !subscription.endpoint) {
        return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Upsert subscription (endpoint + user_id combination is unique)
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            created_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,endpoint'
        });

    if (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { endpoint } = await request.json();
    const supabase = createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!endpoint) {
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);

    if (error) {
        console.error('Error deleting subscription:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
