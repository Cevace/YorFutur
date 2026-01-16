'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting: simple in-memory store (resets on server restart)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 100; // max requests per IP per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return false;
    }

    if (record.count >= RATE_LIMIT) {
        return true;
    }

    record.count++;
    return false;
}

function getDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
        if (/ipad|tablet/i.test(ua)) return 'tablet';
        return 'mobile';
    }
    return 'desktop';
}

function getBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'IE';
    return 'Other';
}

function getOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os x') || ua.includes('macintosh')) return 'Mac';
    if (ua.includes('linux') && !ua.includes('android')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
    return 'Other';
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Rate limit check
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const {
            page_url,
            referrer,
            session_id,
            duration_seconds,
            is_entry,
            is_exit,
            utm_source,
            utm_medium,
            utm_campaign
        } = body;

        // Validate required fields
        if (!page_url) {
            return NextResponse.json(
                { error: 'page_url is required' },
                { status: 400 }
            );
        }

        // Get user agent and derived info
        const userAgent = request.headers.get('user-agent') || '';
        const deviceType = getDeviceType(userAgent);
        const browser = getBrowser(userAgent);
        const os = getOS(userAgent);

        // Use admin client to bypass RLS for insert
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('page_views')
            .insert({
                page_url,
                referrer: referrer || null,
                user_agent: userAgent,
                device_type: deviceType,
                browser,
                os,
                session_id: session_id || null,
                duration_seconds: duration_seconds || 0,
                is_entry: is_entry || false,
                is_exit: is_exit || false,
                utm_source: utm_source || null,
                utm_medium: utm_medium || null,
                utm_campaign: utm_campaign || null,
            });

        if (error) {
            console.error('[Analytics] Insert error:', error);
            return NextResponse.json(
                { error: 'Failed to track page view' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Analytics] Track error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
