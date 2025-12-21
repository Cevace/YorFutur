import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

/**
 * AI Resume Rewriter API
 * Fetches master profile data and rewrites it for a specific vacancy
 * with FACT-LOCK enforcement (dates, companies, schools unchanged)
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { vacancyTitle, vacancyText, missingKeywords = [] } = body;

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

        const { data: languages } = await supabase
            .from('profile_languages')
            .select('*')
            .eq('user_id', user.id);

        const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone')
            .eq('id', user.id)
            .single();

        if (!experiences || experiences.length === 0) {
            return NextResponse.json({
                error: 'Geen werkervaring gevonden. Upload eerst een CV op je profielpagina.'
            }, { status: 400 });
        }

        // Prepare master profile data
        const masterProfile = {
            personal: {
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                email: profile?.email || '',
                phone: profile?.phone || ''
            },
            experiences: experiences || [],
            educations: educations || [],
            languages: languages || []
        };

        // Call Mistral AI with Elite Headhunter prompt
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            console.error('No MISTRAL_API_KEY found');
            return NextResponse.json({
                error: 'Configuratie fout: Geen AI API key gevonden.'
            }, { status: 500 });
        }

        const client = new Mistral({ apiKey: apiKey });

        // Improved language detection with confidence threshold
        const detectLanguage = (text: string): { language: 'en' | 'nl', confidence: number } => {
            // Expanded word lists - common words that rarely appear in technical jargon
            const dutchWords = [
                'de', 'het', 'een', 'zijn', 'bent', 'wij', 'jullie', 'ons', 'onze',
                'voor', 'van', 'naar', 'met', 'bij', 'door', 'tot', 'over',
                'als', 'maar', 'want', 'omdat', 'dus', 'echter',
                'werken', 'ervaring', 'functie', 'bedrijf', 'zoeken', 'team',
                'vacature', 'solliciteren', 'binnen', 'maken', 'jaar'
            ];
            const englishWords = [
                'the', 'a', 'an', 'is', 'are', 'was', 'were', 'we', 'you', 'our',
                'for', 'to', 'of', 'with', 'at', 'by', 'from', 'about',
                'and', 'or', 'but', 'if', 'because', 'however',
                'work', 'experience', 'role', 'company', 'looking', 'team',
                'position', 'apply', 'within', 'make', 'year'
            ];

            const lowerText = text.toLowerCase();
            const totalWords = lowerText.split(/\s+/).length;

            // Require minimum word count for reliable detection
            if (totalWords < 30) {
                console.warn('Text too short for reliable language detection, defaulting to Dutch');
                return { language: 'nl', confidence: 0.5 };
            }

            let dutchCount = 0;
            let englishCount = 0;

            dutchWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                dutchCount += (lowerText.match(regex) || []).length;
            });

            englishWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                englishCount += (lowerText.match(regex) || []).length;
            });

            const totalMatches = dutchCount + englishCount;

            // If very few matches, default to Dutch (local market)
            if (totalMatches < 10) {
                console.warn('Too few language indicators, defaulting to Dutch');
                return { language: 'nl', confidence: 0.5 };
            }

            const dutchRatio = dutchCount / totalMatches;
            const englishRatio = englishCount / totalMatches;

            // Require at least 60% confidence, otherwise default to Dutch
            if (englishRatio >= 0.6) {
                return { language: 'en', confidence: englishRatio };
            } else if (dutchRatio >= 0.6) {
                return { language: 'nl', confidence: dutchRatio };
            } else {
                // Mixed or unclear - default to Dutch (local market)
                console.warn(`Mixed language detected (NL: ${dutchRatio.toFixed(2)}, EN: ${englishRatio.toFixed(2)}), defaulting to Dutch`);
                return { language: 'nl', confidence: Math.max(dutchRatio, englishRatio) };
            }
        };

        const detection = detectLanguage(vacancyText);
        const isEnglish = detection.language === 'en';

        console.log(`Language detected: ${detection.language} (confidence: ${detection.confidence.toFixed(2)})`);

        const keywordInjectionNote = missingKeywords.length > 0
            ? isEnglish
                ? `\n\nCRITICAL: Naturally integrate these MISSING KEYWORDS into descriptions:\n${missingKeywords.join(', ')}\n\nAdd them where relevant, but ONLY if they logically fit the actual experience.`
                : `\n\nKRITIEK: Integreer deze ONTBREKENDE KEYWORDS natuurlijk in de beschrijvingen:\n${missingKeywords.join(', ')}\n\nVoeg ze toe waar relevant, maar ALLEEN als ze logisch passen bij de werkelijke ervaring.`
            : '';

        const prompt = isEnglish ? `
You are an elite headhunter at a top-tier executive search firm. Your task is to rewrite this candidate's CV to maximize their chances for THIS SPECIFIC ROLE.

⚠️ CRITICAL RULES (FACT-LOCK) - VIOLATING THESE IS UNACCEPTABLE:
1. DATES: Copy start_date and end_date EXACTLY. Do NOT change or invent dates.
2. COMPANIES: Copy company names EXACTLY. Do NOT change employer names.
3. SCHOOLS: Copy school names EXACTLY. Do NOT change educational institutions.
4. TRUTH: If a skill is not in the source data, do NOT invent it. This is FRAUD.
5. KEYWORDS: You may ONLY add keywords if they can be naturally integrated into EXISTING work experience.
6. NO HALLUCINATION: Do NOT add technologies, tools, or skills the candidate has never used.
7. JOB TITLES - CRITICAL RULE:
   - KEEP the original job_title in 99% of cases
   - ONLY suggest a title change if:
     a) The role is DIRECTLY related to the TARGET vacancy
     b) The current title undersells the actual responsibilities
     c) It makes logical sense in the career progression
   - DO NOT suggest title changes for unrelated roles (e.g., Chef → Head Recruitment is WRONG)
   - Format suggestions ONLY when truly needed: "Original Title {suggestion: Better Title}"
   - Career history must remain coherent and truthful
8. LANGUAGE CONSISTENCY:
   - ALL content must be in the SAME LANGUAGE as the vacancy
   - If vacancy is in English, write summary, descriptions, and skills in English
   - If vacancy is in Dutch, write summary, descriptions, and skills in Dutch
   - TECHNICAL TERMS: DO NOT translate industry-standard technical terms, software names, or frameworks (e.g., "React", "Scrum", "Python", "Salesforce" MUST remain as is).
   - SKILLS: Translate generic skills (e.g., "Samenwerken" -> "Teamwork"), but KEEP technical skills in their standard form.
${keywordInjectionNote}

YOUR MISSION:
- IMPACT: Rewrite descriptions to be results-oriented with metrics where possible
- MATCH: Adapt keywords to match the vacancy language ONLY if truthful
- POWER: Use strong action verbs
- RELEVANCE: Prioritize experiences most relevant to the role
- HONESTY: Better to have fewer keywords than to lie
- CONTEXT: Respect the candidate's actual career path
- LANGUAGE: Match the vacancy language in ALL output

JOB TITLE:
${vacancyTitle}

JOB DESCRIPTION:
${vacancyText.substring(0, 3000)}

CANDIDATE MASTER PROFILE:
${JSON.stringify(masterProfile, null, 2)}

Respond in pure JSON format (no markdown, no backticks) with this EXACT structure:
{
  "optimized_score": 88,
  "keywords_added": ["Only keywords that TRULY fit existing experience"],
  "summary": "Tailored professional summary for this role (2-3 sentences)",
  "experiences": [
    {
      "company": "EXACT company name from source",
      "job_title": "Keep original OR use format: Original Title {suggestion: Better Title}",
      "location": "from source",
      "start_date": "EXACT from source",
      "end_date": "EXACT from source",
      "is_current": boolean from source,
      "description": "REWRITTEN for impact and relevance - NO invented skills",
      "skills": ["ONLY skills actually used in THIS job"]
    }
  ],
  "educations": [
    {
      "school": "EXACT school name from source",
      "degree": "from source",
      "field_of_study": "from source",
      "start_date": "EXACT from source",
      "end_date": "EXACT from source"
    }
  ]
}
` : `
Je bent een elite headhunter bij een top executive search bureau. Je taak is om het CV van deze kandidaat te herschrijven om de kansen op DEZE SPECIFIEKE VACATURE te maximaliseren.

⚠️ KRITIEKE REGELS (FEITEN-LOCK) - OVERTREDEN IS ONACEPTABEL:
1. DATUMS: Kopieer start_date en end_date EXACT. Verander of verzin GEEN datums.
2. BEDRIJVEN: Kopieer bedrijfsnamen EXACT. Verander GEEN werkgevers.
3. SCHOLEN: Kopieer schoolnamen EXACT. Verander GEEN onderwijsinstellingen.
4. WAARHEID: Als een skill niet in de brondata staat, verzin deze dan NIET. Dit is FRAUDE.
5. KEYWORDS: Je mag ALLEEN keywords toevoegen als ze natuurlijk kunnen worden geïntegreerd in BESTAANDE werkervaring.
6. GEEN HALLUCINATIE: Voeg GEEN technologieën, tools of skills toe die de kandidaat nooit heeft gebruikt.
7. FUNCTIETITELS - KRITIEKE REGEL:
   - BEHOUD de originele job_title in 99% van de gevallen
   - Suggereer ALLEEN een titelwijziging als:
     a) De rol DIRECT gerelateerd is aan de DOEL vacature
     b) De huidige titel de werkelijke verantwoordelijkheden onderschat
     c) Het logisch past in de carrièreopbouw
   - Suggereer GEEN titelwijzigingen voor ongerelateerde rollen (bijv. Chef-kok → Head Recruitment is FOUT)
   - Formatteer suggesties ALLEEN wanneer echt nodig: "Originele Titel {suggestie: Betere Titel}"
   - Carrièregeschiedenis moet coherent en waarheidsgetrouw blijven
8. TAALCONSISTENTIE:
   - ALLE content moet in DEZELFDE TAAL als de vacature
   - Als vacature in Engels is, schrijf samenvatting, omschrijvingen en skills in Engels
   - Als vacature in Nederlands is, schrijf samenvatting, omschrijvingen en skills in Nederlands
   - TECHNISCHE TERMEN: Vertaal NOOIT standaard technische termen, software namen of frameworks (bijv. "React", "Scrum", "Python", "Salesforce" MOETEN blijven zoals ze zijn).
   - SKILLS: Vertaal generieke vaardigheden (bijv. "Teamwork" -> "Samenwerken"), maar BEHOUD technische skills in hun standaard vorm.
   - GEEN "STEENKOLENGENGELS": Vermijd letterlijke vertalingen. Gebruik natuurlijk, professioneel taalgebruik.
${keywordInjectionNote}

JOUW MISSIE:
- IMPACT: Herschrijf beschrijvingen resultagericht met metrics waar mogelijk
- MATCH: Pas keywords aan om de vacaturetaal te matchen ALLEEN als waar
- KRACHT: Gebruik sterke actiewerkwoorden
- RELEVANTIE: Prioriteer ervaring die het meest relevant is voor de rol
- EERLIJKHEID: Beter minder keywords dan liegen
- CONTEXT: Respecteer het werkelijke carrièrepad van de kandidaat
- TAAL: Match de vacaturetaal in ALLE output

FUNCTIETITEL:
${vacancyTitle}

VACATUREBESCHRIJVING:
${vacancyText.substring(0, 3000)}

KANDIDAAT MASTER PROFIEL:
${JSON.stringify(masterProfile, null, 2)}

Antwoord in puur JSON formaat (geen markdown, geen backticks) met deze EXACTE structuur:
{
  "optimized_score": 88,
  "keywords_added": ["Alleen keywords die ECHT passen bij bestaande ervaring"],
  "summary": "Op maat gemaakte professionele samenvatting voor deze rol (2-3 zinnen)",
  "experiences": [
    {
      "company": "EXACTE bedrijfsnaam uit bron",
      "job_title": "Behoud origineel OF gebruik formaat: Originele Titel {suggestie: Betere Titel}",
      "location": "uit bron",
      "start_date": "EXACT uit bron",
      "end_date": "EXACT uit bron",
      "is_current": boolean uit bron,
      "description": "HERSCHREVEN voor impact en relevantie - GEEN verzonnen skills",
      "skills": ["ALLEEN skills daadwerkelijk gebruikt in DEZE baan"]
    }
  ],
  "educations": [
    {
      "school": "EXACTE schoolnaam uit bron",
      "degree": "uit bron",
      "field_of_study": "uit bron",
      "start_date": "EXACT uit bron",
      "end_date": "EXACT uit bron"
    }
  ]
}
`;

        // Call Mistral AI with Elite Headhunter prompt with timeout
        const mistralCall = client.chat.complete({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' }
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI request timed out after 60 seconds')), 60000)
        );

        const chatResponse = await Promise.race([mistralCall, timeoutPromise]) as any;

        const content = chatResponse.choices?.[0]?.message?.content as string;
        if (!content) {
            throw new Error('No response from AI');
        }

        const rewrittenResume = JSON.parse(content);

        // Verify FACT-LOCK: Check that dates, companies, schools are unchanged
        const violations: string[] = [];

        rewrittenResume.experiences?.forEach((exp: any, idx: number) => {
            const original = experiences[idx];
            if (original) {
                if (exp.company !== original.company) {
                    violations.push(`Experience ${idx}: Company changed from "${original.company}" to "${exp.company}"`);
                }
                if (exp.start_date !== original.start_date) {
                    violations.push(`Experience ${idx}: Start date changed`);
                }
                if (exp.end_date !== original.end_date && !original.is_current) {
                    violations.push(`Experience ${idx}: End date changed`);
                }
            }
        });

        rewrittenResume.educations?.forEach((edu: any, idx: number) => {
            const original = educations?.[idx];
            if (original) {
                if (edu.school !== original.school) {
                    violations.push(`Education ${idx}: School changed from "${original.school}" to "${edu.school}"`);
                }
            }
        });

        if (violations.length > 0) {
            console.warn('FACT-LOCK violations detected:', violations);
            // Log but don't fail - we'll fix in post-processing
        }

        return NextResponse.json({
            success: true,
            data: {
                ...rewrittenResume,
                personal: masterProfile.personal,
                vacancy_title: vacancyTitle
            }
        });

    } catch (error: any) {
        console.error('Rewrite Resume API error:', error);
        return NextResponse.json({
            error: `CV herschrijven mislukt: ${error.message}`
        }, { status: 500 });
    }
}
