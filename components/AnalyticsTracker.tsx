'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generate or retrieve session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

// Check if this is the first page in session
function isEntryPage(): boolean {
    if (typeof window === 'undefined') return false;
    const hasEntry = sessionStorage.getItem('analytics_has_entry');
    if (!hasEntry) {
        sessionStorage.setItem('analytics_has_entry', 'true');
        return true;
    }
    return false;
}

function incrementPageCount(): number {
    if (typeof window === 'undefined') return 0;
    const count = parseInt(sessionStorage.getItem('analytics_page_count') || '0', 10) + 1;
    sessionStorage.setItem('analytics_page_count', count.toString());
    return count;
}

// Extract UTM parameters from URL (client-side only)
function getUtmParams(): {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
} {
    if (typeof window === 'undefined') {
        return { utm_source: null, utm_medium: null, utm_campaign: null };
    }
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
    };
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const startTimeRef = useRef<number>(Date.now());
    const hasTrackedRef = useRef<boolean>(false);

    useEffect(() => {
        // Skip tracking in development or for admin/api routes
        if (
            process.env.NODE_ENV === 'development' ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/keystatic')
        ) {
            return;
        }

        // Reset tracking for new page
        startTimeRef.current = Date.now();
        hasTrackedRef.current = false;

        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const isEntry = isEntryPage();
        incrementPageCount();
        const utmParams = getUtmParams();

        // Track initial page view
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_url: pathname,
                referrer,
                session_id: sessionId,
                duration_seconds: 0,
                is_entry: isEntry,
                is_exit: false,
                ...utmParams,
            }),
        }).catch(console.error);

        // Track duration and exit on page leave
        const handleBeforeUnload = () => {
            if (hasTrackedRef.current) return;
            hasTrackedRef.current = true;

            const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

            // Use sendBeacon for reliable unload tracking
            navigator.sendBeacon(
                '/api/analytics/track',
                JSON.stringify({
                    page_url: pathname,
                    session_id: sessionId,
                    duration_seconds: duration,
                    is_entry: false,
                    is_exit: true,
                })
            );
        };

        // Track when user leaves page
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Track when navigating to another page in SPA
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);

            if (!hasTrackedRef.current) {
                hasTrackedRef.current = true;
                const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

                fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page_url: pathname,
                        session_id: sessionId,
                        duration_seconds: duration,
                        is_entry: false,
                        is_exit: false,
                    }),
                    keepalive: true,
                }).catch(console.error);
            }
        };
    }, [pathname]);

    return null;
}
