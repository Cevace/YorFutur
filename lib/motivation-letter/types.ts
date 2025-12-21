export interface MotivationLetterVariant {
    variant_id: 'strategic' | 'culture' | 'storyteller';
    title: string;
    subject_line: string;
    preview: string; // First paragraph for card preview
    why_it_works: string; // Explanation of strategy
    content_body: string;
}

export interface AnalysisInsights {
    step1: string; // Bedrijfscultuur analyse
    step2: string; // Unieke haakje
    step3: string; // Strategische invalshoeken
}

export interface MotivationLetterMeta {
    detected_tone: 'formal' | 'informal';
    key_focus_points: string[];
}

export interface MotivationLetterResponse {
    analysis: AnalysisInsights; // For magical loading screen
    meta: MotivationLetterMeta;
    letters: MotivationLetterVariant[];
}

export interface CandidateExperience {
    company: string;
    role: string;
    achievements: string[];
    start_date?: string;
    end_date?: string | null;
}

export interface CandidateEducation {
    degree: string;
    institution: string;
    field_of_study?: string;
}

export interface CandidateProfile {
    full_name: string;
    current_role?: string;
    experience_years?: number;
    skills: string[];
    experiences: CandidateExperience[];
    education: CandidateEducation[];
    summary?: string;
}

export interface GenerateLetterInput {
    vacancy_text: string;
    candidate_profile: CandidateProfile;
}

export interface StoredMotivationLetter {
    id: string;
    user_id: string;
    vacancy_id?: string;
    vacancy_text: string;
    cv_data: CandidateProfile;
    strategic_variant?: MotivationLetterVariant;
    culture_variant?: MotivationLetterVariant;
    storyteller_variant?: MotivationLetterVariant;
    selected_variant?: 'strategic' | 'culture' | 'storyteller';
    edited_content?: string;
    detected_tone?: 'formal' | 'informal';
    key_focus_points?: string[];
    created_at: string;
    updated_at: string;
}
