// Priority Engine - The "Smart Alerts" Logic
// Derives actionable tasks from raw user data

import { Application, JobMatch, PriorityAction, UserData } from './types';

const STALE_APPLICATION_DAYS = 5;
const HIGH_MATCH_THRESHOLD = 90;

/**
 * Calculates the number of days since a given date
 */
function daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days until a future date
 */
function daysUntil(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check for applications with upcoming interviews
 */
function getInterviewAlerts(applications: Application[]): PriorityAction[] {
    return applications
        .filter(app => app.status === 'interview' && app.interview_date)
        .map(app => {
            const daysRemaining = daysUntil(app.interview_date!);
            const urgency = daysRemaining <= 2 ? 'Morgen!' : `Over ${daysRemaining} dagen`;

            return {
                id: `interview-${app.id}`,
                type: 'critical' as const,
                title: `Bereid je voor op ${app.company_name}`,
                description: `Interview gepland: ${urgency}. ${app.job_title}`,
                actionLabel: 'Start voorbereiding',
                actionHref: `/dashboard/coach?company=${encodeURIComponent(app.company_name)}`,
                relatedId: app.id,
                timestamp: app.interview_date!,
                dismissible: false
            };
        });
}

/**
 * Check for stale applications that need follow-up
 */
function getFollowUpAlerts(applications: Application[]): PriorityAction[] {
    return applications
        .filter(app =>
            app.status === 'applied' &&
            daysSince(app.last_updated_at) > STALE_APPLICATION_DAYS
        )
        .map(app => {
            const daysSinceUpdate = daysSince(app.last_updated_at);

            return {
                id: `followup-${app.id}`,
                type: 'warning' as const,
                title: `Stuur een follow-up naar ${app.company_name}`,
                description: `${daysSinceUpdate} dagen geen reactie op je sollicitatie voor ${app.job_title}`,
                actionLabel: 'Verstuur follow-up',
                actionHref: `/dashboard/tracker?highlight=${app.id}`,
                relatedId: app.id,
                timestamp: app.last_updated_at,
                dismissible: true
            };
        });
}

/**
 * Check for high-match job opportunities
 */
function getOpportunityAlerts(jobMatches: JobMatch[]): PriorityAction[] {
    return jobMatches
        .filter(job => job.match_score >= HIGH_MATCH_THRESHOLD)
        .slice(0, 2) // Only show top 2 opportunities as alerts
        .map(job => ({
            id: `opportunity-${job.id}`,
            type: 'opportunity' as const,
            title: `Perfect match gevonden: ${job.job_title}`,
            description: `${job.match_score}% match bij ${job.company_name}`,
            actionLabel: 'Bekijk vacature',
            actionHref: `/dashboard/radar?job=${job.id}`,
            relatedId: job.id,
            timestamp: job.posted_at,
            dismissible: true
        }));
}

/**
 * Main function: Derives priority actions from user data
 * Returns sorted array with critical items first
 */
export function getPriorityActions(userData: UserData): PriorityAction[] {
    const interviewAlerts = getInterviewAlerts(userData.applications);
    const followUpAlerts = getFollowUpAlerts(userData.applications);
    const opportunityAlerts = getOpportunityAlerts(userData.jobMatches);

    // Combine and sort by priority
    const allActions = [
        ...interviewAlerts,
        ...followUpAlerts,
        ...opportunityAlerts
    ];

    // Sort: critical first, then warning, then opportunity
    const priorityOrder = { critical: 0, warning: 1, opportunity: 2, info: 3 };

    return allActions.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
}

/**
 * Get count of actions by type
 */
export function getActionCounts(actions: PriorityAction[]) {
    return {
        critical: actions.filter(a => a.type === 'critical').length,
        warning: actions.filter(a => a.type === 'warning').length,
        opportunity: actions.filter(a => a.type === 'opportunity').length,
        total: actions.length
    };
}
