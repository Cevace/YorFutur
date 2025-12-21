// TypeScript interfaces for CandidateCommandCenter

export type ApplicationStatus = 'draft' | 'applied' | 'response' | 'interview' | 'offer' | 'rejected';

export type PriorityLevel = 'critical' | 'warning' | 'opportunity' | 'info';

export interface Application {
    id: string;
    company_name: string;
    company_logo?: string;
    job_title: string;
    status: ApplicationStatus;
    applied_at: string;
    last_updated_at: string;
    interview_date?: string;
    recruiter_name?: string;
    notes?: string;
}

export interface JobMatch {
    id: string;
    job_title: string;
    company_name: string;
    company_logo?: string;
    location: string;
    match_score: number; // 0-100
    salary_range?: string;
    posted_at: string;
    requirements_matched: string[];
    requirements_missing: string[];
}

export interface PriorityAction {
    id: string;
    type: PriorityLevel;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    relatedId?: string; // Application or JobMatch ID
    timestamp: string;
    dismissible: boolean;
}

export interface BlogPost {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    coverImage?: string;
    publishedDate: string;
    reading_time?: number;
}

export interface UpcomingEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    type: 'webinar' | 'workshop' | 'networking';
    registrationUrl: string;
}

export interface FunnelStats {
    drafts: number;
    applied: number;
    interviewing: number;
    offers: number;
}

// Agenda event types for the Opportunity Hub
export type AgendaEventType = 'interview' | 'deadline' | 'followup';

export interface AgendaEvent {
    id: string;
    type: AgendaEventType;
    title: string;
    company: string;
    date: string;
    time?: string;
    color: string; // Tailwind color class
}

// AI Recommendation for the Opportunity Hub
export interface AIRecommendation {
    id: string;
    title: string;
    eventType: 'conference' | 'networking' | 'webinar' | 'workshop';
    date: string;
    location: string;
    relevanceReason: string; // Why Mistral AI recommends this
}

export interface UserData {
    firstName: string;
    userRole: string; // e.g., "Technical Buyer", "Software Engineer"
    profileCompletion: number;
    applications: Application[];
    jobMatches: JobMatch[];
    funnelStats: FunnelStats;
    blogPosts: BlogPost[];
    events: UpcomingEvent[];
    // Real applications from Supabase for agenda sync (optional)
    realApplications?: RealJobApplication[];
}

// Real job application type from Supabase (matches tracker.ts type)
export interface RealJobApplication {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    recruiter_name: string | null;
    application_url: string | null;
    status: 'applied' | 'response' | 'interview' | 'offer' | 'rejected';
    notes: string | null;
    deadline_date: string | null;
    interview_date: string | null;
    follow_up_date: string | null;
    created_at: string;
    last_updated_at: string;
}
