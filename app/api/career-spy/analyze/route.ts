import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getMistralClient, MISTRAL_MODEL } from '@/lib/mistral-client';

// Types
interface CandidateProfile {
    name: string;
    culture_type: string;
    work_pace: string;
    structure_preference: string;
    builder_vs_maintainer: string;
    chaos_tolerance: number;
    autonomy_need: number;
}

interface RedFlag {
    category: string;
    headline: string;
    severity: 'low' | 'medium' | 'high';
    source: string;
}

interface CultureMatch {
    fit_score: number;
    warnings: string[];
    risk_level: 'low' | 'medium' | 'high';
    structure_match: number;
    pace_match: number;
}

interface SalaryData {
    min_salary: number;
    max_salary: number;
    cao_scale: string | null;
    market_position: string;
    confidence: number;
}

interface InterviewQuestion {
    question: string;
    reasoning: string;
    what_to_listen_for: string;
}

interface MissionReport {
    company_name: string;
    job_title: string;
    vacancy_url: string;
    candidate_profile: CandidateProfile;
    culture_match: CultureMatch;
    salary_data: SalaryData;
    red_flags: RedFlag[];
    interview_questions: InterviewQuestion[];
    overall_verdict: 'green' | 'yellow' | 'red';
}

// CV Analysis prompt
const CV_ANALYSIS_PROMPT = `Je bent een HR-psycholoog gespecialiseerd in organisatiecultuur.
Analyseer deze CV en bepaal het culturele profiel van de kandidaat.

CV TEKST:
{cvText}

Bepaal:
1. culture_type: "startup" | "scale-up" | "corporate" | "agency" | "nonprofit"
   - Startup: kleine teams, chaos, snelheid, veel eigenaarschap
   - Scale-up: groeiend bedrijf, processen opbouwen
   - Corporate: grote organisatie, stabiliteit, matrix
   - Agency: klantgericht, deadlines, variatie
   - Nonprofit: missiegedreven, consensus

2. work_pace: "fast" | "moderate" | "slow"
3. structure_preference: "flat" | "matrix" | "hierarchical"
4. builder_vs_maintainer: "builder" | "optimizer" | "maintainer"
5. chaos_tolerance: 1-10 (kan omgaan met onduidelijkheid)
6. autonomy_need: 1-10 (hoeveel vrijheid nodig)

Let op: bedrijfsnamen, verblijfsduur, functietitels.

Output ALLEEN geldige JSON:
{
  "name": "naam uit CV",
  "culture_type": "startup",
  "work_pace": "fast",
  "structure_preference": "flat",
  "builder_vs_maintainer": "builder",
  "chaos_tolerance": 7,
  "autonomy_need": 8
}`;

// Full analysis prompt
const ANALYSIS_PROMPT = `Je bent een career intelligence analyst die kandidaten beschermt tegen slechte job matches.

KANDIDAAT PROFIEL:
{candidateProfile}

VACATURE INFO:
Bedrijf: {companyName}
Functie: {jobTitle}
URL: {vacancyUrl}

Voer een complete analyse uit en genereer een Mission Report:

1. CULTURE MATCH: Vergelijk kandidaat cultuurtype met wat je weet over dit type bedrijf
2. SALARY: Schat een realistische salarisrange op basis van functie en sector
3. RED FLAGS: Genereer mogelijke waarschuwingen gebaseerd op de mismatch
4. INTERVIEW QUESTIONS: 3 kritische vragen om de cultuur te testen

BELANGRIJK: Gebruik GEEN emoji's. Begin elke warning met een label in HOOFDLETTERS gevolgd door een dubbelpunt, zoals:
- "STRUCTUUR CLASH: ..."
- "TEMPO MISMATCH: ..."
- "AUTONOMIE RISICO: ..."
- "BUILDER VS. MAINTAINER: ..."

Output ALLEEN geldige JSON:
{
  "culture_match": {
    "fit_score": 65,
    "warnings": [
      "STRUCTUUR CLASH: Je komt uit een platte organisatie maar dit lijkt een hiërarchische structuur.",
      "TEMPO MISMATCH: Je bent gewend aan snelle besluitvorming maar dit bedrijf werkt langzamer."
    ],
    "risk_level": "medium",
    "structure_match": 60,
    "pace_match": 50
  },
  "salary_data": {
    "min_salary": 3500,
    "max_salary": 4500,
    "cao_scale": "CAO naam of null",
    "market_position": "at_market",
    "confidence": 70
  },
  "red_flags": [
    {
      "category": "culture",
      "headline": "Basis waarschuwing",
      "severity": "medium",
      "source": "Analyse"
    }
  ],
  "interview_questions": [
    {
      "question": "Kun je me door het proces leiden van hoe een belangrijke beslissing recent is genomen?",
      "reasoning": "Dit onthult de echte besluitvormingsstructuur",
      "what_to_listen_for": "Als het weken duurde, bevestigt dit trage besluitvorming"
    },
    {
      "question": "Wat is het verloop in dit team geweest het afgelopen jaar?",
      "reasoning": "Hoog verloop is een rode vlag",
      "what_to_listen_for": "Ontwijkende antwoorden zijn suspect"
    },
    {
      "question": "Hoeveel ruimte zou ik hebben om zelf beslissingen te nemen?",
      "reasoning": "Test autonomie niveau",
      "what_to_listen_for": "Vage antwoorden suggereert beperkte vrijheid"
    }
  ],
  "overall_verdict": "yellow"
}`;

function parseJsonFromResponse(response: string): any {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error('[Career Spy] JSON parse error:', e);
            throw new Error('Failed to parse AI response');
        }
    }
    throw new Error('No JSON found in response');
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data
        const formData = await request.formData();
        const cvText = formData.get('cvText') as string;
        const vacancyUrl = formData.get('vacancyUrl') as string;
        const companyName = formData.get('companyName') as string || 'Onbekend Bedrijf';
        const jobTitle = formData.get('jobTitle') as string || 'Onbekende Functie';

        if (!cvText) {
            return NextResponse.json({ error: 'CV tekst is vereist' }, { status: 400 });
        }

        if (!vacancyUrl) {
            return NextResponse.json({ error: 'Vacature URL is vereist' }, { status: 400 });
        }

        console.log('[Career Spy] Starting analysis for:', companyName, jobTitle);

        // Get Mistral client
        const mistral = getMistralClient();

        // Step 1: Analyze CV
        console.log('[Career Spy] Step 1: Analyzing CV...');
        const cvPrompt = CV_ANALYSIS_PROMPT.replace('{cvText}', cvText.substring(0, 5000)); // Limit size

        const cvResponse = await mistral.chat.complete({
            model: MISTRAL_MODEL,
            messages: [{ role: 'user', content: cvPrompt }],
            temperature: 0.3,
        });

        const cvContent = cvResponse.choices?.[0]?.message?.content;
        if (!cvContent || typeof cvContent !== 'string') {
            throw new Error('No CV analysis response');
        }

        const candidateProfile: CandidateProfile = parseJsonFromResponse(cvContent);
        console.log('[Career Spy] CV Profile:', candidateProfile.culture_type);

        // Step 2: Full Analysis
        console.log('[Career Spy] Step 2: Running full analysis...');
        const analysisPrompt = ANALYSIS_PROMPT
            .replace('{candidateProfile}', JSON.stringify(candidateProfile, null, 2))
            .replace('{companyName}', companyName)
            .replace('{jobTitle}', jobTitle)
            .replace('{vacancyUrl}', vacancyUrl);

        const analysisResponse = await mistral.chat.complete({
            model: MISTRAL_MODEL,
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.4,
        });

        const analysisContent = analysisResponse.choices?.[0]?.message?.content;
        if (!analysisContent || typeof analysisContent !== 'string') {
            throw new Error('No analysis response');
        }

        const analysisResult = parseJsonFromResponse(analysisContent);
        console.log('[Career Spy] Analysis complete. Fit score:', analysisResult.culture_match?.fit_score);

        // Build final report
        const report: MissionReport = {
            company_name: companyName,
            job_title: jobTitle,
            vacancy_url: vacancyUrl,
            candidate_profile: candidateProfile,
            culture_match: analysisResult.culture_match || {
                fit_score: 50,
                warnings: [],
                risk_level: 'medium',
                structure_match: 50,
                pace_match: 50
            },
            salary_data: analysisResult.salary_data || {
                min_salary: 3000,
                max_salary: 5000,
                cao_scale: null,
                market_position: 'at_market',
                confidence: 50
            },
            red_flags: analysisResult.red_flags || [],
            interview_questions: analysisResult.interview_questions || [],
            overall_verdict: analysisResult.overall_verdict || 'yellow'
        };

        console.log('[Career Spy] Report generated successfully');
        return NextResponse.json({ report });

    } catch (error) {
        console.error('[Career Spy] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Analysis failed' },
            { status: 500 }
        );
    }
}
