import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getMistralClient, MISTRAL_MODEL } from '@/lib/mistral-client';

type AssessmentCategory = 'abstract' | 'verbal' | 'numerical' | 'logical' | 'sequences' | 'analogies';

// Prompts per category
const CATEGORY_PROMPTS: Record<AssessmentCategory, string> = {
    abstract: `Generate a challenging abstract reasoning question similar to Raven's Progressive Matrices.
The question should test pattern recognition and logical thinking.
Format: A visual pattern with 8 cells where the 9th is missing, and 4 options.
Since we cannot show images, describe the pattern using shapes (circle, square, triangle), 
fills (solid, outline, striped), rotations (0, 90, 180, 270), and colors.`,

    verbal: `Generate a verbal reasoning question in Dutch that tests reading comprehension and logical conclusions.
Provide a short text passage (3-5 sentences) followed by a statement.
The user must determine if the statement is TRUE, FALSE, or CANNOT SAY based only on the passage.
Include 4 answer options with one clear correct answer.`,

    numerical: `Generate a numerical reasoning question in Dutch with data/tables/graphs.
Test the ability to interpret data and perform calculations.
Include a table or dataset, a question about it, and 4 numeric answer options.
Focus on percentages, ratios, or trend analysis.`,

    logical: `Generate a logical deduction question in Dutch using syllogisms.
Provide 2-3 premises and ask which conclusion must be true.
Example format: "All A are B. Some B are C. Which conclusion is valid?"
Include 4 answer options with one logically correct answer.`,

    sequences: `Generate a number sequence question.
Provide a sequence of 5-6 numbers following a pattern.
Ask what the next number in the sequence is.
Include 4 numeric answer options.
Use patterns like: arithmetic, geometric, Fibonacci-style, or alternating operations.`,

    analogies: `Generate a verbal analogy question in Dutch.
Format: "A is to B as C is to ?"
The relationship should be clear (synonyms, antonyms, part-whole, category-member, etc.)
Include 4 word options as answers.`
};

// Question interface matching AssessmentRunner expectations
interface GeneratedQuestion {
    id: string;
    type: string;
    question: string;
    context: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    difficulty_index: number;
}

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { category, count = 5 } = body as { category: AssessmentCategory; count?: number };

        if (!category || !CATEGORY_PROMPTS[category]) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const client = getMistralClient();
        const questions: GeneratedQuestion[] = [];

        // Generate questions one by one for better quality
        for (let i = 0; i < count; i++) {
            const prompt = `${CATEGORY_PROMPTS[category]}

Generate question ${i + 1} with difficulty level: ${i < 2 ? 'easy (0.3-0.5)' : i < 4 ? 'medium (0.5-0.7)' : 'hard (0.7-0.9)'}.

Respond in valid JSON format with this exact structure:
{
    "type": "${category === 'verbal' ? 'Verbal Reasoning' : category === 'numerical' ? 'Numerical Reasoning' : category === 'logical' ? 'Logical Deduction' : category === 'sequences' ? 'Number Sequences' : category === 'analogies' ? 'Verbal Analogies' : 'Abstract Reasoning'}",
    "question": "The question text",
    "context": "Background info or passage",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Why this answer is correct",
    "difficulty_index": 0.5
}

IMPORTANT: correct_answer is a 0-indexed number (0, 1, 2, or 3).
IMPORTANT: All text must be in Dutch except for abstract reasoning which can use shape descriptions.`;

            const response = await client.chat.complete({
                model: MISTRAL_MODEL,
                messages: [{ role: 'user', content: prompt }],
                responseFormat: { type: 'json_object' },
                temperature: 0.8, // More creativity for varied questions
                maxTokens: 1000,
            });

            const content = response.choices?.[0]?.message?.content as string;
            if (content) {
                try {
                    const parsed = JSON.parse(content);
                    questions.push({
                        id: `${category}-ai-${Date.now()}-${i}`,
                        type: parsed.type || category,
                        question: parsed.question,
                        context: parsed.context,
                        options: parsed.options,
                        correct_answer: typeof parsed.correct_answer === 'number'
                            ? parsed.correct_answer
                            : parseInt(parsed.correct_answer) || 0,
                        explanation: parsed.explanation,
                        difficulty_index: parsed.difficulty_index || 0.5 + (i * 0.1),
                    });
                } catch (parseError) {
                    console.error('Failed to parse question:', parseError);
                    // Continue with next question
                }
            }
        }

        if (questions.length === 0) {
            return NextResponse.json(
                { error: 'Failed to generate questions', fallback: true },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            questions,
            generated: questions.length,
            requested: count,
        });

    } catch (error: any) {
        console.error('Assessment generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate questions', fallback: true },
            { status: 500 }
        );
    }
}
