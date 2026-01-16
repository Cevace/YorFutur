// Type definitions for CV Builder
export interface PersonalInfo {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
}

export interface Experience {
    id: number;
    role: string;
    company: string;
    city: string;
    start: string;
    end: string;
    description: string;
}

export interface Education {
    id: number;
    school: string;
    degree: string;
    city: string;
    start: string;
    end: string;
    description: string;
}

export interface CVData {
    personal: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

export interface AuditIssue {
    type: 'error' | 'warning';
    text: string;
    field: string;
}

export interface AuditResult {
    score: number;
    issues: AuditIssue[];
}
