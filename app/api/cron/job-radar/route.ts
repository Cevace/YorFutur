import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { searchJobsInternal } from '@/actions/job-search';

// Configuration
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET!;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:info@cevace.nl',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

export async function GET(request: Request) {
    // 1. Verify Cron Secret (Security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // 2. Fetch all unique users with active push subscriptions
    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');

    if (error || !subscriptions) {
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    console.log(`Starting Real Job Radar Run for ${subscriptions.length} subscriptions...`);

    const results = [];
    const apiKey = process.env.SERPER_API_KEY;

    // 3. Loop through subscriptions (users)
    for (const sub of subscriptions) {
        try {
            // a. Get stored search preference
            const { data: searchPref } = await supabase
                .from('job_radar_searches')
                .select('*')
                .eq('user_id', sub.user_id)
                .order('created_at', { ascending: false }) // Get latest
                .limit(1)
                .single();

            if (!searchPref) {
                console.log(`User ${sub.user_id} has no saved search.`);
                continue;
            }

            // b. Execute Real Search (Internal)
            // We force '24h' freshness for daily cron usage to be efficient
            console.log(`Searching for user ${sub.user_id}: ${searchPref.query}`);
            const searchResult = await searchJobsInternal(
                searchPref.query,
                searchPref.location || 'Nederland',
                'alles', // Sector not stored yet, default to all
                '24h',
                apiKey
            );

            if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
                console.log(`No jobs found for user ${sub.user_id}`);
                continue;
            }

            // c. Filter duplicates (jobs already notified/stored)
            const { data: existingMatches } = await supabase
                .from('job_matches')
                .select('job_data')
                .eq('user_id', sub.user_id)
                .order('created_at', { ascending: false })
                .limit(50); // Optimization: only check last 50 matches

            const seenUrls = new Set(existingMatches?.map((row: any) => row.job_data.url) || []);

            const newJobs = searchResult.data.filter(job => !seenUrls.has(job.url));

            if (newJobs.length === 0) {
                console.log(`No new unique jobs for user ${sub.user_id}`);
                continue;
            }

            // d. Save new matches to DB
            for (const job of newJobs) {
                await supabase.from('job_matches').insert({
                    user_id: sub.user_id,
                    job_data: job,
                    match_score: 100, // Explicit search match
                    is_new: true,
                    seen: false
                });
            }

            // e. Send Push Notification
            const payload = JSON.stringify({
                title: `🎯 ${newJobs.length} Nieuwe Vacatures`,
                body: `Voor "${searchPref.query}": ${newJobs[0].title} bij ${newJobs[0].company}...`,
                url: '/dashboard/radar'
            });

            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, payload);

            results.push({ userId: sub.user_id, status: 'notified', count: newJobs.length });

        } catch (err) {
            console.error(`Error processing user ${sub.user_id}:`, err);

            // Handle expired subscriptions (410 Gone)
            if ((err as any).statusCode === 410) {
                console.log(`Deleting expired subscription for user ${sub.user_id}`);
                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
            results.push({ userId: sub.user_id, status: 'failed', error: err });
        }
    }

    return NextResponse.json({
        success: true,
        processed: subscriptions.length,
        results
    });
}
