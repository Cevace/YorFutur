// Interview Coach Database Schema
// TypeScript Types for Interview Coach

export type ApplicationStatus = 'preparation' | 'applied' | 'hired' | 'rejected';
export type IntelligenceStatus = 'pending' | 'researching' | 'complete' | 'failed';
export type InterviewPhase = 'INTRO' | 'ASK' | 'ANSWER' | 'FEEDBACK' | 'SUMMARY' | 'COMPLETED';
export type MessageRole = 'assistant' | 'user' | 'system';

export interface Application {
    id: string;
    user_id: string;

    // User Input
    company_name: string;
    job_title: string;
    vacancy_text?: string;
    cv_snapshot?: string;

    // AI Enriched
    company_culture_summary?: string;
    recent_company_news?: string;
    intelligence_status: IntelligenceStatus;

    // Status
    status: ApplicationStatus;

    // Metadata
    created_at: string;
    updated_at: string;
}

export interface InterviewSession {
    id: string;
    application_id: string;
    user_id: string;

    // State
    current_phase: InterviewPhase;

    // Metadata
    total_questions: number;
    started_at: string;
    completed_at?: string;

    // Analytics
    overall_score?: number;
    feedback_summary?: string;
}

export interface InterviewMessage {
    id: string;
    session_id: string;
    role: MessageRole;
    content: string;
    created_at: string;
}

// Combined types for UI
export interface ApplicationWithSessions extends Application {
    sessions?: InterviewSession[];
}

export interface SessionWithMessages extends InterviewSession {
    messages: InterviewMessage[];
    application: Application;
}
