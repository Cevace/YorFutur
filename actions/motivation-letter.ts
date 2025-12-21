'use server';

import { getMistralClient, MISTRAL_MODEL } from '@/lib/mistral-client';
import { SYSTEM_PROMPT, formatUserPrompt } from '@/lib/motivation-letter/system-prompt';
import type {
    GenerateLetterInput,
    MotivationLetterResponse,
    StoredMotivationLetter,
} from '@/lib/motivation-letter/types';
import { createClient, createAdminClient } from '@/utils/supabase/server';

/**
 * Generate 3 motivation letter variants using Mistral AI
 */
export async function generateMotivationLettersAction(
    input: GenerateLetterInput,
    vacancyId?: string
): Promise<{
    success: boolean;
    data?: MotivationLetterResponse;
    error?: string;
    letter_id?: string;
}> {
    try {
        console.log('[generateMotivationLettersAction] Starting generation...');

        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[generateMotivationLettersAction] Auth error:', authError);
            return { success: false, error: 'Unauthorized' };
        }

        console.log('[generateMotivationLettersAction] User authenticated:', user.id);

        // 2. Fetch user's REAL CV data from profile
        console.log('[generateMotivationLettersAction] Fetching user CV data...');

        const [experiencesResult, educationsResult, profileResult] = await Promise.all([
            supabase.from('profile_experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
            supabase.from('profile_educations').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
            supabase.from('profiles').select('first_name, last_name, city, linkedin_url, summary').eq('id', user.id).single()
        ]);

        // Build enriched candidate profile with REAL data
        const enrichedProfile = {
            full_name: profileResult.data
                ? `${profileResult.data.first_name || ''} ${profileResult.data.last_name || ''}`.trim()
                : input.candidate_profile.full_name || 'Kandidaat',
            email: user.email,
            city: profileResult.data?.city || '',
            linkedin_url: profileResult.data?.linkedin_url || '',
            summary: profileResult.data?.summary || '',
            experiences: experiencesResult.data || [],
            education: educationsResult.data || []
        };

        console.log('[generateMotivationLettersAction] Profile data loaded:');
        console.log('- Experiences:', enrichedProfile.experiences.length);
        console.log('- Education:', enrichedProfile.education.length);

        // 3. Prepare user message with REAL CV data
        const userMessage = formatUserPrompt(input.vacancy_text, enrichedProfile);

        console.log('[generateMotivationLettersAction] Calling Mistral AI...');
        console.log('Vacancy text length:', input.vacancy_text.length);
        console.log('Using REAL profile data:', Object.keys(enrichedProfile));

        // 4. Call Mistral AI with JSON mode
        const mistralClient = getMistralClient();

        const chatResponse = await mistralClient.chat.complete({
            model: MISTRAL_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ],
            responseFormat: { type: 'json_object' }, // Force JSON output
            temperature: 0.7, // Balanced creativity
            maxTokens: 3000, // ~3 letters x 350 words each
        });

        console.log('[generateMotivationLettersAction] Mistral response received');

        // 4. Parse response
        const messageContent = chatResponse.choices?.[0]?.message?.content;

        if (!messageContent) {
            console.error('[generateMotivationLettersAction] No content in response');
            throw new Error('No response from Mistral AI');
        }

        // Handle content (can be string or array)
        const content = typeof messageContent === 'string'
            ? messageContent
            : JSON.stringify(messageContent);

        console.log('[generateMotivationLettersAction] Content length:', content.length);

        let parsedResponse: MotivationLetterResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (parseError) {
            console.error('[generateMotivationLettersAction] JSON parse error:', parseError);
            console.error('Content:', content.substring(0, 500));
            throw new Error('Invalid JSON response from AI');
        }

        // 5. Validate response structure
        if (!parsedResponse.letters || parsedResponse.letters.length !== 3) {
            console.error('[generateMotivationLettersAction] Invalid letter count:', parsedResponse.letters?.length);
            throw new Error('AI did not generate 3 letter variants');
        }

        // Ensure all variant_ids are present
        const variantIds = parsedResponse.letters.map(l => l.variant_id);
        const requiredIds = ['strategic', 'culture', 'storyteller'];
        const missingIds = requiredIds.filter(id => !variantIds.includes(id as any));

        if (missingIds.length > 0) {
            console.error('[generateMotivationLettersAction] Missing variants:', missingIds);
            throw new Error(`Missing letter variants: ${missingIds.join(', ')}`);
        }

        console.log('[generateMotivationLettersAction] Validation passed, storing in database...');

        // 6. Store in database
        const adminSupabase = createAdminClient();

        const { data: letterRecord, error: dbError } = await adminSupabase
            .from('motivation_letters')
            .insert({
                user_id: user.id,
                vacancy_id: vacancyId || null,
                vacancy_text: input.vacancy_text,
                cv_data: input.candidate_profile,
                analysis_insights: parsedResponse.analysis, // For magical loading screen
                strategic_variant: parsedResponse.letters.find(l => l.variant_id === 'strategic'),
                culture_variant: parsedResponse.letters.find(l => l.variant_id === 'culture'),
                storyteller_variant: parsedResponse.letters.find(l => l.variant_id === 'storyteller'),
                detected_tone: parsedResponse.meta.detected_tone,
                key_focus_points: parsedResponse.meta.key_focus_points,
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[generateMotivationLettersAction] Database error:', dbError);
            throw new Error('Failed to save letters');
        }

        console.log('[generateMotivationLettersAction] Success! Letter ID:', letterRecord.id);

        return {
            success: true,
            data: parsedResponse,
            letter_id: letterRecord.id,
        };

    } catch (error) {
        console.error('[generateMotivationLettersAction] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

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

        const supabase = await createClient();
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
        const supabase = await createClient();
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
        const supabase = await createClient();
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
        const supabase = await createClient();
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
