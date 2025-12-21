import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

/**
 * CV Analysis API - Phase 1 of Power Score
 * Analyzes CV against vacancy to calculate initial ATS score and identify missing keywords
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { vacancyTitle, vacancyText } = body;

        if (!vacancyTitle || !vacancyText) {
            return NextResponse.json({ error: 'Missing vacancy title or text' }, { status: 400 });
        }

        // Fetch master profile data from database
        const { data: experiences } = await supabase
            .from('profile_experiences')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

        const { data: educations } = await supabase
            .from('profile_educations')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

        if (!experiences || experiences.length === 0) {
            return NextResponse.json({
                error: 'Geen werkervaring gevonden. Upload eerst een CV op je profielpagina.'
            }, { status: 400 });
        }

        // Prepare profile summary for analysis
        const profileSummary = {
            experiences: experiences.map(exp => ({
                company: exp.company,
                job_title: exp.job_title,
                description: exp.description,
                skills: exp.skills || []
            })),
            educations: educations?.map(edu => ({
                school: edu.school,
                degree: edu.degree,
                field_of_study: edu.field_of_study
            })) || []
        };

        // Call Mistral AI for analysis
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            console.error('No MISTRAL_API_KEY found');
            return NextResponse.json({
                error: 'Configuratie fout: Geen AI API key gevonden.'
            }, { status: 500 });
        }

        const client = new Mistral({ apiKey: apiKey });

        const prompt = `
Je bent een ATS (Applicant Tracking System) expert en recruiter. Analyseer dit CV tegen deze vacature en geef een eerlijke beoordeling.

VACATURE TITEL:
${vacancyTitle}

VACATURE TEKST:
${vacancyText.substring(0, 3000)}

KANDIDAAT PROFIEL:
${JSON.stringify(profileSummary, null, 2)}

ANALYSEER:
1. Bereken een ATS Score (0-100) gebaseerd op keyword matching en relevantie
2. Identificeer ONTBREKENDE keywords uit de vacature die niet in het CV staan
3. Identificeer ZWAKKE PUNTEN (generieke beschrijvingen, geen metrics, etc.)
4. Geef AANBEVELINGEN voor verbetering

Geef antwoord in puur JSON formaat (geen markdown, geen backticks) met deze EXACTE structuur:
{
  "initial_score": 45,
  "missing_keywords": ["Agile", "Stakeholder Management", "SaaS", "KPI's"],
  "weak_points": [
    "Beschrijvingen zijn te generiek",
    "Geen meetbare resultaten genoemd",
    "Belangrijke skills uit vacature ontbreken"
  ],
  "recommendations": [
    "Voeg concrete metrics toe (bijv. percentages, aantallen)",
    "Gebruik actieve werkwoorden",
    "Integreer missing keywords natuurlijk in beschrijvingen"
  ],
  "ats_status": "Needs Improvement"
}
`;

        const chatResponse = await client.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' }
        });

        const content = chatResponse.choices?.[0]?.message?.content as string;
        if (!content) {
            throw new Error('No response from AI');
        }

        const analysis = JSON.parse(content);

        return NextResponse.json({
            success: true,
            data: analysis
        });

    } catch (error: any) {
        console.error('Analyze CV API error:', error);
        return NextResponse.json({
            error: `CV analyse mislukt: ${error.message}`
        }, { status: 500 });
    }
}
