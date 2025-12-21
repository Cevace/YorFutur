'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AssessmentScoreData {
    category: 'abstract' | 'verbal' | 'numerical' | 'logical' | 'sequences' | 'analogies';
    mode: 'drill' | 'exam';
    raw_score: number;
    total_questions: number;
    sten_score: number;
    percentile: number;
    accuracy: number;
    speed: number;
    difficulty_handling: number;
    duration_seconds: number;
}

export interface UserStats {
    total_completed: number;
    avg_sten_score: number;
    best_sten_score: number;
    avg_accuracy: number;
    avg_percentile: number;
}

// Save assessment score to database
export async function saveAssessmentScore(data: AssessmentScoreData) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Not authenticated' };
    }

    // Input validation
    const validCategories = ['abstract', 'verbal', 'numerical', 'logical', 'sequences', 'analogies'];
    const validModes = ['drill', 'exam'];

    if (!validCategories.includes(data.category)) {
        return { error: 'Invalid category' };
    }
    if (!validModes.includes(data.mode)) {
        return { error: 'Invalid mode' };
    }
    if (data.sten_score < 1 || data.sten_score > 10) {
        return { error: 'Invalid STEN score' };
    }
    if (data.accuracy < 0 || data.accuracy > 100) {
        return { error: 'Invalid accuracy' };
    }

    const { error } = await supabase
        .from('assessment_scores')
        .insert({
            user_id: user.id,
            category: data.category,
            mode: data.mode,
            raw_score: Math.max(0, Math.floor(data.raw_score)),
            total_questions: Math.max(1, Math.floor(data.total_questions)),
            sten_score: Math.min(10, Math.max(1, Number(data.sten_score.toFixed(1)))),
            percentile: Math.min(100, Math.max(0, Math.floor(data.percentile))),
            accuracy: Math.min(100, Math.max(0, Math.floor(data.accuracy))),
            speed: Math.min(100, Math.max(0, Math.floor(data.speed))),
            difficulty_handling: Math.min(100, Math.max(0, Math.floor(data.difficulty_handling))),
            duration_seconds: Math.max(0, Math.floor(data.duration_seconds)),
        });

    if (error) {
        console.error('Error saving assessment score:', error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/assessment');
    return { success: true };
}

// Get user's assessment statistics
export async function getUserAssessmentStats(): Promise<UserStats | null> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from('user_assessment_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        // No scores yet, return defaults
        return {
            total_completed: 0,
            avg_sten_score: 0,
            best_sten_score: 0,
            avg_accuracy: 0,
            avg_percentile: 0
        };
    }

    return data as UserStats;
}

// Get recent assessment scores for a user
export async function getRecentAssessmentScores(limit: number = 10) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return [];
    }

    const { data, error } = await supabase
        .from('assessment_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching scores:', error);
        return [];
    }

    return data;
}

// Get best score per category
export async function getBestScoresByCategory() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {};
    }

    const { data, error } = await supabase
        .from('assessment_scores')
        .select('category, sten_score')
        .eq('user_id', user.id)
        .order('sten_score', { ascending: false });

    if (error || !data) {
        return {};
    }

    // Get best score per category
    const bestScores: Record<string, number> = {};
    for (const score of data) {
        if (!bestScores[score.category] || score.sten_score > bestScores[score.category]) {
            bestScores[score.category] = score.sten_score;
        }
    }

    return bestScores;
}
