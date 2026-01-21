'use server';

import { createClient } from '@/utils/supabase/server';
import type { CVData } from '@/actions/cv-builder';

export type TunerSessionData = {
    sessionId: string;
    vacancyTitle: string;
    vacancyText: string;
    initialScore: number;
    optimizedScore: number;
    keywordsAdded: string[];
    optimizedCvData: CVData;
    recommendedTemplate?: string;
};

/**
 * Save CV Tuner optimization results to session for Builder handoff
 * Session expires after 24 hours
 */
export async function saveTunerSession(data: Omit<TunerSessionData, 'sessionId'>): Promise<{
    success: boolean;
    sessionId?: string;
    error?: string;
}> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Save session to database
        const { data: session, error } = await supabase
            .from('cv_tuner_sessions')
            .insert({
                user_id: user.id,
                vacancy_title: data.vacancyTitle,
                vacancy_text: data.vacancyText,
                initial_score: data.initialScore,
                optimized_score: data.optimizedScore,
                keywords_added: data.keywordsAdded,
                optimized_cv_data: data.optimizedCvData as any, // JSONB
                recommended_template: data.recommendedTemplate || 'modern'
            })
            .select('id')
            .single();

        if (error) {
            console.error('saveTunerSession error:', error);
            throw error;
        }

        console.log('[TunerSession] Created:', session.id);

        return { success: true, sessionId: session.id };
    } catch (error: any) {
        console.error('Error saving tuner session:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Retrieve CV Tuner session data for Builder pre-fill
 */
export async function getTunerSession(sessionId: string): Promise<{
    success: boolean;
    data?: TunerSessionData;
    error?: string;
}> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data: session, error } = await supabase
            .from('cv_tuner_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id) // Security: only own sessions
            .single();

        if (error) {
            console.error('getTunerSession error:', error);
            throw error;
        }

        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        // Check expiry
        const expiresAt = new Date(session.expires_at);
        if (expiresAt < new Date()) {
            return { success: false, error: 'Session expired (24h limit)' };
        }

        console.log('[TunerSession] Retrieved:', sessionId);

        return {
            success: true,
            data: {
                sessionId: session.id,
                vacancyTitle: session.vacancy_title,
                vacancyText: session.vacancy_text,
                initialScore: session.initial_score,
                optimizedScore: session.optimized_score,
                keywordsAdded: session.keywords_added || [],
                optimizedCvData: session.optimized_cv_data as CVData,
                recommendedTemplate: session.recommended_template || 'modern'
            }
        };
    } catch (error: any) {
        console.error('Error fetching tuner session:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's most recent tuner session (for quick access)
 */
export async function getLatestTunerSession(): Promise<{
    success: boolean;
    data?: TunerSessionData;
    error?: string;
}> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data: session, error } = await supabase
            .from('cv_tuner_sessions')
            .select('*')
            .eq('user_id', user.id)
            .gt('expires_at', new Date().toISOString()) // Not expired
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !session) {
            return { success: false, error: 'No recent sessions' };
        }

        return {
            success: true,
            data: {
                sessionId: session.id,
                vacancyTitle: session.vacancy_title,
                vacancyText: session.vacancy_text,
                initialScore: session.initial_score,
                optimizedScore: session.optimized_score,
                keywordsAdded: session.keywords_added || [],
                optimizedCvData: session.optimized_cv_data as CVData,
                recommendedTemplate: session.recommended_template || 'modern'
            }
        };
    } catch (error: any) {
        console.error('Error fetching latest session:', error);
        return { success: false, error: error.message };
    }
}
