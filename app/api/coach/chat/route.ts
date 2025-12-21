import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { buildSystemPrompt, getNextPhase } from '@/lib/interview-coach/prompts';
import { addMessage, updateSessionPhase } from '@/actions/interview-coach/sessions';
import type { InterviewMessage } from '@/lib/interview-coach/types';
import { rateLimit, RATE_LIMITS, RateLimitError } from '@/lib/interview-coach/rate-limit';
import { sanitizeUserMessage } from '@/lib/interview-coach/sanitization';

// Request deduplication store
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Interview Chat API
 * Handles conversation with Mistral AI
 * 
 * PROTECTED: Auth + rate limiting + input validation + deduplication
 */
export async function POST(req: NextRequest) {
    try {
        // 1. AUTH CHECK
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. RATE LIMITING
        try {
            rateLimit(`chat:${user.id}`, RATE_LIMITS.CHAT);
        } catch (err) {
            if (err instanceof RateLimitError) {
                return NextResponse.json(
                    { error: 'Too many requests', retryAfter: err.retryAfter },
                    { status: 429, headers: { 'Retry-After': err.retryAfter.toString() } }
                );
            }
            throw err;
        }

        // 3. INPUT VALIDATION
        const { sessionId, userMessage } = await req.json();

        if (!sessionId || !userMessage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (typeof userMessage !== 'string' || userMessage.length > 2000) {
            return NextResponse.json(
                { error: 'Invalid message (max 2000 characters)' },
                { status: 400 }
            );
        }

        // SANITIZE user message to prevent prompt injection
        const sanitizedMessage = sanitizeUserMessage(userMessage);

        if (!sanitizedMessage || sanitizedMessage.length < 3) {
            return NextResponse.json(
                { error: 'Message too short or invalid' },
                { status: 400 }
            );
        }

        // 4. REQUEST DEDUPLICATION
        const requestKey = `${user.id}:${sessionId}:${sanitizedMessage}`;
        if (pendingRequests.has(requestKey)) {
            // Return existing promise to prevent duplicate processing
            return await pendingRequests.get(requestKey)!;
        }

        // Create promise for this request
        const requestPromise = (async () => {
            try {
                // 5. Fetch session with ownership check
                const { data: session, error: sessionError } = await supabase
                    .from('interview_sessions')
                    .select(`
    *,
    application: applications(*)
      `)
                    .eq('id', sessionId)
                    .eq('user_id', user.id) // Ensure session belongs to the authenticated user
                    .single();

                if (sessionError || !session) {
                    return NextResponse.json(
                        { error: 'Session not found' },
                        { status: 404 }
                    );
                }

                // Get conversation history
                const { data: messages } = await supabase
                    .from('interview_messages')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: true });

                // Build system prompt
                const systemPrompt = buildSystemPrompt(session.application, session);

                // Build conversation history for Mistral
                const conversationHistory: Array<{ role: string; content: string }> = [
                    { role: 'system', content: systemPrompt }
                ];

                // Add previous messages
                if (messages) {
                    messages.forEach((msg: InterviewMessage) => {
                        conversationHistory.push({
                            role: msg.role === 'assistant' ? 'assistant' : 'user',
                            content: msg.content
                        });
                    });
                }

                // Add current user message
                conversationHistory.push({
                    role: 'user',
                    content: userMessage
                });

                // Call Mistral AI
                const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'mistral-large-latest',
                        messages: conversationHistory,
                        temperature: 0.7,
                        max_tokens: 300 // Keep responses concise
                    })
                });

                if (!mistralResponse.ok) {
                    const errorText = await mistralResponse.text();
                    console.error('Mistral API error:', {
                        status: mistralResponse.status,
                        statusText: mistralResponse.statusText,
                        body: errorText
                    });
                    throw new Error(`Mistral API error: ${mistralResponse.status}`);
                }

                let mistralData;
                try {
                    const responseText = await mistralResponse.text();
                    console.log('Mistral response length:', responseText.length);
                    mistralData = JSON.parse(responseText);
                } catch (parseError: any) {
                    console.error('Failed to parse Mistral response:', parseError);
                    throw new Error(`Invalid Mistral response: ${parseError.message}`);
                }

                if (!mistralData.choices || !mistralData.choices[0] || !mistralData.choices[0].message) {
                    console.error('Invalid Mistral response structure:', mistralData);
                    throw new Error('Invalid Mistral response structure');
                }

                const aiMessage = mistralData.choices[0].message.content;

                if (!aiMessage || aiMessage.trim() === '') {
                    console.error('Empty AI response');
                    throw new Error('Empty AI response');
                }

                // Save both messages to database (use sanitized message)
                await addMessage(sessionId, 'user', sanitizedMessage);
                await addMessage(sessionId, 'assistant', aiMessage);

                // Update phase (state machine progression)
                const nextPhase = getNextPhase(session.current_phase, session.total_questions);
                if (nextPhase !== session.current_phase) {
                    await updateSessionPhase(sessionId, nextPhase);
                }

                return NextResponse.json({
                    message: aiMessage,
                    phase: nextPhase,
                    questionCount: session.total_questions + (session.current_phase === 'ASK' ? 1 : 0)
                });
            } finally {
                // Remove from pending requests
                pendingRequests.delete(requestKey);
            }
        })();

        // Store promise
        pendingRequests.set(requestKey, requestPromise);

        // Return result
        return await requestPromise;

    } catch (error: any) {
        console.error('Coach chat error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
