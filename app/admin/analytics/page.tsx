import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import AnalyticsDashboard from './AnalyticsDashboard';

// Admin email whitelist
const ADMIN_EMAILS = ['p.wienecke@kaynow.nl'];

// Date range options
type DateRangeType = '7d' | '30d' | '90d' | 'all';

function getDateRange(range: DateRangeType): { start: string | null; label: string } {
    const now = new Date();
    switch (range) {
        case '7d':
            return {
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                label: 'Laatste 7 dagen'
            };
        case '30d':
            return {
                start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                label: 'Laatste 30 dagen'
            };
        case '90d':
            return {
                start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                label: 'Laatste 90 dagen'
            };
        case 'all':
            return { start: null, label: 'Alles' };
        default:
            return {
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                label: 'Laatste 7 dagen'
            };
    }
}

export default async function AnalyticsPage({
    searchParams
}: {
    searchParams: { range?: string }
}) {
    const supabase = createClient();

    // Security check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        redirect('/dashboard');
    }

    // Get date range from URL params
    const rangeParam = (searchParams.range as DateRangeType) || '7d';
    const { start: rangeStart, label: rangeLabel } = getDateRange(rangeParam);

    // Use admin client to fetch analytics data
    const adminSupabase = createAdminClient();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // Fetch today's page views
    const { count: todayViews } = await adminSupabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart);

    // Fetch unique sessions today
    const { data: todaySessions } = await adminSupabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', todayStart)
        .not('session_id', 'is', null);

    const uniqueVisitorsToday = new Set(todaySessions?.map(s => s.session_id)).size;

    // Build query for range data
    let rangeQuery = adminSupabase.from('page_views').select('created_at');
    if (rangeStart) {
        rangeQuery = rangeQuery.gte('created_at', rangeStart);
    }
    const { data: rangeData } = await rangeQuery.order('created_at', { ascending: true });

    // Group by day
    const dailyViews: { date: string; views: number }[] = [];
    const dayMap = new Map<string, number>();

    rangeData?.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short'
        });
        dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    dayMap.forEach((views, date) => {
        dailyViews.push({ date, views });
    });

    // Fetch top pages for range
    let topPagesQuery = adminSupabase.from('page_views').select('page_url');
    if (rangeStart) {
        topPagesQuery = topPagesQuery.gte('created_at', rangeStart);
    }
    const { data: topPagesData } = await topPagesQuery;

    const pageCountMap = new Map<string, number>();
    topPagesData?.forEach(row => {
        pageCountMap.set(row.page_url, (pageCountMap.get(row.page_url) || 0) + 1);
    });

    const topPages = Array.from(pageCountMap.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // Fetch average session duration for range
    let durationQuery = adminSupabase.from('page_views').select('duration_seconds').gt('duration_seconds', 0);
    if (rangeStart) {
        durationQuery = durationQuery.gte('created_at', rangeStart);
    }
    const { data: durationData } = await durationQuery;

    const avgDuration = durationData?.length
        ? Math.round(durationData.reduce((sum, r) => sum + r.duration_seconds, 0) / durationData.length)
        : 0;

    // Fetch device breakdown for range
    let deviceQuery = adminSupabase.from('page_views').select('device_type');
    if (rangeStart) {
        deviceQuery = deviceQuery.gte('created_at', rangeStart);
    }
    const { data: deviceData } = await deviceQuery;

    const deviceMap = new Map<string, number>();
    deviceData?.forEach(row => {
        const device = row.device_type || 'unknown';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });

    const deviceBreakdown = Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device, count }));

    // Total views in range
    const totalRangeViews = rangeData?.length || 0;

    // Total unique sessions in range
    let sessionsQuery = adminSupabase.from('page_views').select('session_id').not('session_id', 'is', null);
    if (rangeStart) {
        sessionsQuery = sessionsQuery.gte('created_at', rangeStart);
    }
    const { data: rangeSessions } = await sessionsQuery;
    const uniqueVisitorsInRange = new Set(rangeSessions?.map(s => s.session_id)).size;

    // ========== NEW FEATURES ==========

    // Fetch referrer stats
    let referrerQuery = adminSupabase.from('page_views').select('referrer').not('referrer', 'is', null).not('referrer', 'eq', '');
    if (rangeStart) {
        referrerQuery = referrerQuery.gte('created_at', rangeStart);
    }
    const { data: referrerData } = await referrerQuery;

    const referrerMap = new Map<string, number>();
    referrerData?.forEach(row => {
        try {
            const url = new URL(row.referrer);
            const domain = url.hostname.replace('www.', '');
            referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
        } catch {
            referrerMap.set('Direct', (referrerMap.get('Direct') || 0) + 1);
        }
    });

    const topReferrers = Array.from(referrerMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Fetch browser stats
    let browserQuery = adminSupabase.from('page_views').select('browser');
    if (rangeStart) {
        browserQuery = browserQuery.gte('created_at', rangeStart);
    }
    const { data: browserData } = await browserQuery;

    const browserMap = new Map<string, number>();
    browserData?.forEach(row => {
        const browser = row.browser || 'Unknown';
        browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });

    const browserBreakdown = Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

    // Fetch OS stats
    let osQuery = adminSupabase.from('page_views').select('os');
    if (rangeStart) {
        osQuery = osQuery.gte('created_at', rangeStart);
    }
    const { data: osData } = await osQuery;

    const osMap = new Map<string, number>();
    osData?.forEach(row => {
        const os = row.os || 'Unknown';
        osMap.set(os, (osMap.get(os) || 0) + 1);
    });

    const osBreakdown = Array.from(osMap.entries())
        .map(([os, count]) => ({ os, count }))
        .sort((a, b) => b.count - a.count);

    // Fetch UTM campaign stats
    let utmQuery = adminSupabase.from('page_views').select('utm_source, utm_medium, utm_campaign').not('utm_source', 'is', null);
    if (rangeStart) {
        utmQuery = utmQuery.gte('created_at', rangeStart);
    }
    const { data: utmData } = await utmQuery;

    const utmMap = new Map<string, { source: string; medium: string; campaign: string; count: number }>();
    utmData?.forEach(row => {
        const key = `${row.utm_source || 'direct'}|${row.utm_medium || 'none'}|${row.utm_campaign || 'none'}`;
        const existing = utmMap.get(key);
        if (existing) {
            existing.count++;
        } else {
            utmMap.set(key, {
                source: row.utm_source || 'direct',
                medium: row.utm_medium || 'none',
                campaign: row.utm_campaign || 'none',
                count: 1
            });
        }
    });

    const utmCampaigns = Array.from(utmMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Calculate bounce rate (sessions with only 1 page view)
    let bounceQuery = adminSupabase.from('page_views').select('session_id').not('session_id', 'is', null);
    if (rangeStart) {
        bounceQuery = bounceQuery.gte('created_at', rangeStart);
    }
    const { data: bounceData } = await bounceQuery;

    const sessionPageCounts = new Map<string, number>();
    bounceData?.forEach(row => {
        sessionPageCounts.set(row.session_id, (sessionPageCounts.get(row.session_id) || 0) + 1);
    });

    const totalSessions = sessionPageCounts.size;
    const bouncedSessions = Array.from(sessionPageCounts.values()).filter(count => count === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    // Fetch hourly distribution
    let hourlyQuery = adminSupabase.from('page_views').select('created_at');
    if (rangeStart) {
        hourlyQuery = hourlyQuery.gte('created_at', rangeStart);
    }
    const { data: hourlyData } = await hourlyQuery;

    const hourlyMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) hourlyMap.set(i, 0);
    hourlyData?.forEach(row => {
        const hour = new Date(row.created_at).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });

    const hourlyDistribution = Array.from(hourlyMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);

    // Live visitors (unique sessions in last 5 minutes)
    const { data: liveData } = await adminSupabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', fiveMinutesAgo)
        .not('session_id', 'is', null);

    const liveVisitors = new Set(liveData?.map(s => s.session_id)).size;

    // Entry pages (pages with is_entry = true)
    let entryQuery = adminSupabase.from('page_views').select('page_url').eq('is_entry', true);
    if (rangeStart) {
        entryQuery = entryQuery.gte('created_at', rangeStart);
    }
    const { data: entryData } = await entryQuery;

    const entryMap = new Map<string, number>();
    entryData?.forEach(row => {
        entryMap.set(row.page_url, (entryMap.get(row.page_url) || 0) + 1);
    });

    const topEntryPages = Array.from(entryMap.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Exit pages (pages with is_exit = true)
    let exitQuery = adminSupabase.from('page_views').select('page_url').eq('is_exit', true);
    if (rangeStart) {
        exitQuery = exitQuery.gte('created_at', rangeStart);
    }
    const { data: exitData } = await exitQuery;

    const exitMap = new Map<string, number>();
    exitData?.forEach(row => {
        exitMap.set(row.page_url, (exitMap.get(row.page_url) || 0) + 1);
    });

    const topExitPages = Array.from(exitMap.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <AnalyticsDashboard
            todayViews={todayViews || 0}
            uniqueVisitorsToday={uniqueVisitorsToday}
            dailyViews={dailyViews}
            topPages={topPages}
            avgDuration={avgDuration}
            deviceBreakdown={deviceBreakdown}
            currentRange={rangeParam}
            rangeLabel={rangeLabel}
            totalRangeViews={totalRangeViews}
            uniqueVisitorsInRange={uniqueVisitorsInRange}
            // New props
            topReferrers={topReferrers}
            browserBreakdown={browserBreakdown}
            osBreakdown={osBreakdown}
            utmCampaigns={utmCampaigns}
            bounceRate={bounceRate}
            hourlyDistribution={hourlyDistribution}
            liveVisitors={liveVisitors}
            topEntryPages={topEntryPages}
            topExitPages={topExitPages}
        />
    );
}
