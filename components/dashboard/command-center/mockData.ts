// Mock data for CandidateCommandCenter
// This data simulates various states to demonstrate all alert types

import { Application, JobMatch, BlogPost, UpcomingEvent, FunnelStats, UserData, AgendaEvent, AIRecommendation } from './types';

// Helper to get dates relative to now
const daysAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

const daysFromNow = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
};

// Applications in various states to trigger different alerts
export const mockApplications: Application[] = [
    {
        id: 'app-1',
        company_name: 'Booking.com',
        company_logo: '/logos/booking.svg',
        job_title: 'Senior Frontend Developer',
        status: 'interview',
        applied_at: daysAgo(14),
        last_updated_at: daysAgo(2),
        interview_date: daysFromNow(3), // Interview in 3 days - CRITICAL ALERT
        recruiter_name: 'Sarah van der Berg',
        notes: 'Technical interview + culture fit'
    },
    {
        id: 'app-2',
        company_name: 'Adyen',
        company_logo: '/logos/adyen.svg',
        job_title: 'Full Stack Engineer',
        status: 'applied',
        applied_at: daysAgo(8),
        last_updated_at: daysAgo(8), // 8 days no update - WARNING ALERT
        recruiter_name: 'Mark de Vries'
    },
    {
        id: 'app-3',
        company_name: 'Coolblue',
        company_logo: '/logos/coolblue.svg',
        job_title: 'React Developer',
        status: 'applied',
        applied_at: daysAgo(12),
        last_updated_at: daysAgo(12), // 12 days no update - WARNING ALERT
    },
    {
        id: 'app-4',
        company_name: 'Picnic',
        company_logo: '/logos/picnic.svg',
        job_title: 'Software Engineer',
        status: 'response',
        applied_at: daysAgo(5),
        last_updated_at: daysAgo(1),
        recruiter_name: 'Lisa Jansen'
    },
    {
        id: 'app-5',
        company_name: 'Bol.com',
        company_logo: '/logos/bol.svg',
        job_title: 'Frontend Engineer',
        status: 'offer',
        applied_at: daysAgo(21),
        last_updated_at: daysAgo(1),
        recruiter_name: 'Thomas Bakker'
    },
    {
        id: 'app-6',
        company_name: 'ING',
        company_logo: '/logos/ing.svg',
        job_title: 'JavaScript Developer',
        status: 'rejected',
        applied_at: daysAgo(30),
        last_updated_at: daysAgo(5),
    },
    {
        id: 'app-7',
        company_name: 'Spotify',
        company_logo: '/logos/spotify.svg',
        job_title: 'Web Platform Engineer',
        status: 'draft',
        applied_at: daysAgo(1),
        last_updated_at: daysAgo(1),
    }
];

// Job matches with varying scores
export const mockJobMatches: JobMatch[] = [
    {
        id: 'job-1',
        job_title: 'Senior React Developer',
        company_name: 'Stripe',
        company_logo: '/logos/stripe.svg',
        location: 'Amsterdam (Hybrid)',
        match_score: 96, // OPPORTUNITY ALERT
        salary_range: '€85,000 - €110,000',
        posted_at: daysAgo(1),
        requirements_matched: ['React', 'TypeScript', 'Node.js', 'GraphQL', '5+ years experience'],
        requirements_missing: []
    },
    {
        id: 'job-2',
        job_title: 'Frontend Team Lead',
        company_name: 'Klarna',
        company_logo: '/logos/klarna.svg',
        location: 'Amsterdam',
        match_score: 92, // OPPORTUNITY ALERT
        salary_range: '€90,000 - €120,000',
        posted_at: daysAgo(2),
        requirements_matched: ['React', 'Leadership', 'TypeScript', 'Agile'],
        requirements_missing: ['Fintech experience']
    },
    {
        id: 'job-3',
        job_title: 'Full Stack Developer',
        company_name: 'MessageBird',
        company_logo: '/logos/messagebird.svg',
        location: 'Remote (Netherlands)',
        match_score: 88,
        salary_range: '€70,000 - €95,000',
        posted_at: daysAgo(3),
        requirements_matched: ['React', 'Node.js', 'PostgreSQL'],
        requirements_missing: ['Go', 'Kubernetes']
    },
    {
        id: 'job-4',
        job_title: 'UI Engineer',
        company_name: 'Figma',
        company_logo: '/logos/figma.svg',
        location: 'Remote (EU)',
        match_score: 85,
        posted_at: daysAgo(5),
        requirements_matched: ['React', 'CSS', 'Design Systems'],
        requirements_missing: ['C++', 'WebAssembly']
    },
    {
        id: 'job-5',
        job_title: 'Software Engineer',
        company_name: 'Notion',
        company_logo: '/logos/notion.svg',
        location: 'Dublin / Remote',
        match_score: 78,
        posted_at: daysAgo(7),
        requirements_matched: ['JavaScript', 'React'],
        requirements_missing: ['Rust', 'Distributed Systems']
    }
];

// Content feed
export const mockBlogPosts: BlogPost[] = [
    {
        title: 'Hoe je een ATS-proof CV maakt in 2024',
        excerpt: 'Leer de nieuwste technieken om je CV door Applicant Tracking Systems te krijgen.',
        coverImage: '/blog/ats-cv.jpg',
        slug: 'ats-proof-cv-2024',
        category: 'CV Tips',
        publishedDate: daysAgo(2),
        reading_time: 6
    },
    {
        title: 'De 5 meest gestelde sollicitatievragen',
        excerpt: 'Bereid je voor op de vragen die je gegarandeerd krijgt in elk interview.',
        coverImage: '/blog/interview-questions.jpg',
        slug: '5-interview-vragen',
        category: 'Interview',
        publishedDate: daysAgo(5),
        reading_time: 8
    }
];

export const mockEvents: UpcomingEvent[] = [
    {
        id: 'event-1',
        title: 'Tech Networking Event Amsterdam',
        date: daysFromNow(7),
        time: '18:00',
        type: 'networking',
        registrationUrl: '/events/tech-networking'
    },
    {
        id: 'event-2',
        title: 'Webinar: Salarisonderhandeling Tips',
        date: daysFromNow(14),
        time: '12:00',
        type: 'webinar',
        registrationUrl: '/events/salary-webinar'
    }
];

// Funnel statistics
export const mockFunnelStats: FunnelStats = {
    drafts: 2,
    applied: 4,
    interviewing: 1,
    offers: 1
};

// Complete user data object
export const mockUserData: UserData = {
    firstName: 'Thomas',
    userRole: 'Senior Frontend Developer',
    profileCompletion: 85,
    applications: mockApplications,
    jobMatches: mockJobMatches,
    funnelStats: mockFunnelStats,
    blogPosts: mockBlogPosts,
    events: mockEvents
};

/**
 * Get agenda events from applications
 * Scans applications for interviews, deadlines, and follow-up dates
 */
export function getAgendaEvents(applications: Application[]): AgendaEvent[] {
    const events: AgendaEvent[] = [];

    applications.forEach(app => {
        // Interview events (Blue)
        if (app.status === 'interview' && app.interview_date) {
            const date = new Date(app.interview_date);
            events.push({
                id: `interview-${app.id}`,
                type: 'interview',
                title: `Interview bij ${app.company_name}`,
                company: app.company_name,
                date: app.interview_date,
                time: date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
                color: 'bg-blue-500'
            });
        }

        // Follow-up events (Yellow) - applications > 7 days without response
        if (app.status === 'applied') {
            const daysSince = Math.floor((Date.now() - new Date(app.last_updated_at).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince > 7) {
                events.push({
                    id: `followup-${app.id}`,
                    type: 'followup',
                    title: `Follow-up: ${app.company_name}`,
                    company: app.company_name,
                    date: new Date().toISOString(),
                    color: 'bg-yellow-500'
                });
            }
        }
    });

    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get AI recommendations based on user role
 * Simulates Mistral AI response with personalized event suggestions
 */
export function getAIRecommendations(userRole: string): AIRecommendation[] {
    // Mock AI recommendations based on role
    const techRoles = ['developer', 'engineer', 'frontend', 'backend', 'full stack'];
    const isTechRole = techRoles.some(role => userRole.toLowerCase().includes(role));

    if (isTechRole) {
        return [
            {
                id: 'ai-1',
                title: 'React Summit Amsterdam 2025',
                eventType: 'conference',
                date: daysFromNow(45),
                location: 'Amsterdam RAI',
                relevanceReason: 'Perfect voor jouw React expertise. Veel networking kansen met tech leads van top bedrijven.'
            },
            {
                id: 'ai-2',
                title: 'Tech Talent Networking Night',
                eventType: 'networking',
                date: daysFromNow(12),
                location: 'WeWork Amsterdam',
                relevanceReason: 'Recruiters van Adyen, Booking.com en Picnic zijn aanwezig.'
            },
            {
                id: 'ai-3',
                title: 'Webinar: Salary Negotiation for Devs',
                eventType: 'webinar',
                date: daysFromNow(5),
                location: 'Online',
                relevanceReason: 'Je hebt een aanbod van Bol.com - dit helpt bij onderhandelen!'
            }
        ];
    }

    // Default recommendations
    return [
        {
            id: 'ai-1',
            title: 'BouwBeurs 2025',
            eventType: 'conference',
            date: daysFromNow(30),
            location: 'Jaarbeurs Utrecht',
            relevanceReason: 'Relevant voor Technical Buyers in de bouwsector.'
        },
        {
            id: 'ai-2',
            title: 'Career Development Workshop',
            eventType: 'workshop',
            date: daysFromNow(14),
            location: 'Online',
            relevanceReason: 'Leer effectieve sollicitatietechnieken.'
        }
    ];
}
