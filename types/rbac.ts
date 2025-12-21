// Types for RBAC system
export type UserRole = 'super_admin' | 'support' | 'content_manager' | 'user';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface StaffUser extends Profile {
    last_sign_in_at: string | null;
}
