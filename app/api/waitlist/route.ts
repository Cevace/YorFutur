import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Insert into waitlist table
        const { data, error: dbError } = await supabase
            .from('waitlist')
            .insert([
                {
                    email: email.toLowerCase().trim(),
                    metadata: {
                        source: 'landing_page',
                        signup_date: new Date().toISOString(),
                        user_agent: request.headers.get('user-agent'),
                    },
                },
            ])
            .select()
            .single();

        if (dbError) {
            // Check if email already exists
            if (dbError.code === '23505') {
                return NextResponse.json(
                    { error: 'Dit emailadres staat al op de wachtlijst!' },
                    { status: 409 }
                );
            }

            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Er is iets misgegaan. Probeer het opnieuw.' },
                { status: 500 }
            );
        }

        // Sync with Brevo (if API key is configured)
        if (process.env.BREVO_API_KEY && process.env.BREVO_WAITLIST_LIST_ID) {
            try {
                await syncToBrevo(email, data.id);
            } catch (brevoError) {
                console.error('Brevo sync error:', brevoError);
                // Don't fail the request if Brevo sync fails
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Je bent toegevoegd aan de wachtlijst! We houden je op de hoogte.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Waitlist API error:', error);
        return NextResponse.json(
            { error: 'Er is iets misgegaan. Probeer het opnieuw.' },
            { status: 500 }
        );
    }
}

async function syncToBrevo(email: string, waitlistId: string) {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY!,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            listIds: [parseInt(process.env.BREVO_WAITLIST_LIST_ID!)],
            updateEnabled: false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Brevo API error: ${error}`);
    }

    const data = await response.json();

    // Update waitlist record with Brevo contact ID
    const supabase = createClient();
    await supabase
        .from('waitlist')
        .update({
            synced_to_brevo: true,
            brevo_contact_id: data.id?.toString(),
        })
        .eq('id', waitlistId);

    return data;
}
