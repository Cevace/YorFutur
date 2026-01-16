'use server';

import { createClient } from '@/utils/supabase/server';
import type { StoredMotivationLetter } from '@/lib/motivation-letter/types';

/**
 * Motivation Letter Server Actions
 * 
 * Note: Letter generation has been moved to /api/motivation-letter/generate
 * for better timeout control and error handling.
 */

/**
 * Save edited letter content
 */
export async function saveEditedLetterAction(
    letterId: string,
    selectedVariant: 'strategic' | 'culture' | 'storyteller',
    editedContent: string
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[saveEditedLetterAction] Saving edits...', { letterId, selectedVariant });

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error: updateError } = await supabase
            .from('motivation_letters')
            .update({
                selected_variant: selectedVariant,
                edited_content: editedContent,
            })
            .eq('id', letterId)
            .eq('user_id', user.id); // RLS enforcement

        if (updateError) {
            console.error('[saveEditedLetterAction] Update error:', updateError);
            throw new Error('Failed to save edits');
        }

        console.log('[saveEditedLetterAction] Success');
        return { success: true };

    } catch (error) {
        console.error('[saveEditedLetterAction] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Save failed'
        };
    }
}

/**
 * Get user's motivation letters
 */
export async function getUserMotivationLettersAction(): Promise<{
    success: boolean;
    letters?: StoredMotivationLetter[];
    error?: string;
}> {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data: letters, error: fetchError } = await supabase
            .from('motivation_letters')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('[getUserMotivationLettersAction] Fetch error:', fetchError);
            throw new Error('Failed to fetch letters');
        }

        return {
            success: true,
            letters: letters as StoredMotivationLetter[],
        };

    } catch (error) {
        console.error('[getUserMotivationLettersAction] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Fetch failed'
        };
    }
}

/**
 * Get specific motivation letter by ID
 */
export async function getMotivationLetterAction(
    letterId: string
): Promise<{
    success: boolean;
    letter?: StoredMotivationLetter;
    error?: string;
}> {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data: letter, error: fetchError } = await supabase
            .from('motivation_letters')
            .select('*')
            .eq('id', letterId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) {
            console.error('[getMotivationLetterAction] Fetch error:', fetchError);
            throw new Error('Letter not found');
        }

        return {
            success: true,
            letter: letter as StoredMotivationLetter,
        };

    } catch (error) {
        console.error('[getMotivationLetterAction] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Fetch failed'
        };
    }
}

/**
 * Delete motivation letter
 */
export async function deleteMotivationLetterAction(
    letterId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error: deleteError } = await supabase
            .from('motivation_letters')
            .delete()
            .eq('id', letterId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('[deleteMotivationLetterAction] Delete error:', deleteError);
            throw new Error('Failed to delete letter');
        }

        return { success: true };

    } catch (error) {
        console.error('[deleteMotivationLetterAction] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed'
        };
    }
}
