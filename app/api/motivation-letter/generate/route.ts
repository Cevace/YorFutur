import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getMistralClient, MISTRAL_MODEL } from '@/lib/mistral-client';
import { SYSTEM_PROMPT, formatUserPrompt } from '@/lib/motivation-letter/system-prompt';
import type {
    GenerateLetterInput,
    MotivationLetterResponse,
} from '@/lib/motivation-letter/types';

// Configure maximum execution time for Vercel (Pro/Enterprise)
export const maxDuration = 90; // 90 seconds

/**
 * Generate 3 motivation letter variants using Mistral AI
 * Converted from Server Action to API Route for better timeout control
 */
export async function POST(req: NextRequest) {
    try {
        console.log('[generateMotivationLetters API] Starting generation...');

        // 1. Authenticate user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[generateMotivationLetters API] Auth error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[generateMotivationLetters API] User authenticated:', user.id);

        // Parse request body
        const body = await req.json();
        const { vacancy_text, candidate_profile, vacancy_id } = body as GenerateLetterInput & { vacancy_id?: string };

        if (!vacancy_text || !candidate_profile) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Fetch user's REAL CV data from profile
        console.log('[generateMotivationLetters API] Fetching user CV data...');

        const [experiencesResult, educationsResult, profileResult] = await Promise.all([
            supabase.from('profile_experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
            supabase.from('profile_educations').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
            supabase.from('profiles').select('first_name, last_name, city, linkedin_url, summary').eq('id', user.id).single()
        ]);

        // Build enriched candidate profile with REAL data
        const enrichedProfile = {
            full_name: profileResult.data
                ? `${profileResult.data.first_name || ''} ${profileResult.data.last_name || ''}`.trim()
                : candidate_profile.full_name || 'Kandidaat',
            email: user.email,
            city: profileResult.data?.city || '',
            linkedin_url: profileResult.data?.linkedin_url || '',
            summary: profileResult.data?.summary || '',
            experiences: experiencesResult.data || [],
            education: educationsResult.data || []
        };

        console.log('[generateMotivationLetters API] Profile data loaded:');
        console.log('- Experiences:', enrichedProfile.experiences.length);
        console.log('- Education:', enrichedProfile.education.length);

        // 3. Prepare user message with REAL CV data
        const userMessage = formatUserPrompt(vacancy_text, enrichedProfile);

        console.log('[generateMotivationLetters API] Calling Mistral AI...');
        console.log('Vacancy text length:', vacancy_text.length);
        console.log('Using REAL profile data:', Object.keys(enrichedProfile));

        // 4. Call Mistral AI with JSON mode and TIMEOUT PROTECTION
        const mistralClient = getMistralClient();

        const mistralCall = mistralClient.chat.complete({
            model: MISTRAL_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ],
            responseFormat: { type: 'json_object' }, // Force JSON output
            temperature: 0.7, // Balanced creativity
            maxTokens: 3000, // ~3 letters x 350 words each
        });

        // Add 90-second timeout protection (matching maxDuration)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI generation timed out after 90 seconds')), 90000)
        );

        const chatResponse = await Promise.race([mistralCall, timeoutPromise]) as any;

        console.log('[generateMotivationLetters API] Mistral response received');

        // 5. Parse response
        const messageContent = chatResponse.choices?.[0]?.message?.content;

        if (!messageContent) {
            console.error('[generateMotivationLetters API] No content in response');
            throw new Error('No response from Mistral AI');
        }

        // Handle content (can be string or array)
        const content = typeof messageContent === 'string'
            ? messageContent
            : JSON.stringify(messageContent);

        console.log('[generateMotivationLetters API] Content length:', content.length);

        let parsedResponse: MotivationLetterResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (parseError) {
            console.error('[generateMotivationLetters API] JSON parse error:', parseError);
            console.error('Content:', content.substring(0, 500));
            throw new Error('Invalid JSON response from AI');
        }

        // 6. Validate response structure
        if (!parsedResponse.letters || parsedResponse.letters.length !== 3) {
            console.error('[generateMotivationLetters API] Invalid letter count:', parsedResponse.letters?.length);
            throw new Error('AI did not generate 3 letter variants');
        }

        // Ensure all variant_ids are present
        const variantIds = parsedResponse.letters.map(l => l.variant_id);
        const requiredIds = ['strategic', 'culture', 'storyteller'];
        const missingIds = requiredIds.filter(id => !variantIds.includes(id as any));

        if (missingIds.length > 0) {
            console.error('[generateMotivationLetters API] Missing variants:', missingIds);
            throw new Error(`Missing letter variants: ${missingIds.join(', ')}`);
        }

        // Validate each letter has required fields
        parsedResponse.letters.forEach((letter, index) => {
            if (!letter.content_body?.trim()) {
                throw new Error(`Letter ${index + 1} has empty content`);
            }
            if (!letter.subject_line?.trim()) {
                throw new Error(`Letter ${index + 1} missing subject line`);
            }
            if (!letter.title?.trim()) {
                throw new Error(`Letter ${index + 1} missing title`);
            }
            if (!letter.preview?.trim()) {
                throw new Error(`Letter ${index + 1} missing preview`);
            }
            if (!letter.why_it_works?.trim()) {
                throw new Error(`Letter ${index + 1} missing why_it_works explanation`);
            }
        });

        console.log('[generateMotivationLetters API] Validation passed, storing in database...');

        // 7. Store in database using regular client (RLS applies)
        const { data: letterRecord, error: dbError } = await supabase
            .from('motivation_letters')
            .insert({
                user_id: user.id,
                vacancy_id: vacancy_id || null,
                vacancy_text: vacancy_text,
                cv_data: candidate_profile,
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
            console.error('[generateMotivationLetters API] Database error:', dbError);
            throw new Error('Failed to save letters');
        }

        console.log('[generateMotivationLetters API] Success! Letter ID:', letterRecord.id);

        return NextResponse.json({
            success: true,
            data: parsedResponse,
            letter_id: letterRecord.id,
        });

    } catch (error: any) {
        console.error('[generateMotivationLetters API] Error:', error);

        // Check if it's a timeout error
        if (error.message?.includes('timed out')) {
            return NextResponse.json({
                success: false,
                error: 'De AI generatie duurt te lang. Probeer het opnieuw met een kortere vacaturetekst.'
            }, { status: 408 }); // 408 Request Timeout
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        }, { status: 500 });
    }
}
