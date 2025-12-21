'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    InterviewSession,
    InterviewMessage,
    InterviewPhase,
    SessionWithMessages
} from '@/lib/interview-coach/types';

/**
 * Create a new interview session for an application
 */
export async function createSession(applicationId: string): Promise<{
    success: boolean;
    data?: InterviewSession;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
            application_id: applicationId,
            user_id: user.id,
            current_phase: 'INTRO' as InterviewPhase,
            total_questions: 0
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/coach');
    return { success: true, data };
}

/**
 * Get session with all messages and application context
 */
export async function getSession(sessionId: string): Promise<SessionWithMessages | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('interview_sessions')
        .select(`
      *,
      messages:interview_messages(*),
      application:applications(*)
    `)
        .eq('id', sessionId)
        .single();

    if (error) return null;
    return data as SessionWithMessages;
}

/**
 * Update session phase (state machine progression)
 */
export async function updateSessionPhase(
    sessionId: string,
    phase: InterviewPhase
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('interview_sessions')
        .update({ current_phase: phase })
        .eq('id', sessionId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/coach/${sessionId}`);
    return { success: true };
}

/**
 * Complete a session with final feedback
 */
export async function completeSession(
    sessionId: string,
    overallScore?: number,
    feedbackSummary?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('interview_sessions')
        .update({
            current_phase: 'COMPLETED' as InterviewPhase,
            completed_at: new Date().toISOString(),
            overall_score: overallScore,
            feedback_summary: feedbackSummary
        })
        .eq('id', sessionId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/coach/${sessionId}`);
    return { success: true };
}

/**
 * Add a message to the conversation
 */
export async function addMessage(
    sessionId: string,
    role: 'assistant' | 'user',
    content: string
): Promise<{ success: boolean; data?: InterviewMessage; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('interview_messages')
        .insert({
            session_id: sessionId,
            role,
            content
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Increment question count if this is an assistant message
    if (role === 'assistant') {
        await supabase.rpc('increment_question_count', { session_id: sessionId });
    }

    revalidatePath(`/coach/${sessionId}`);
    return { success: true, data };
}

/**
 * Get all messages for a session
 */
export async function getMessages(sessionId: string): Promise<InterviewMessage[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('interview_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}
