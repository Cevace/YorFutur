import type { Application, InterviewSession, InterviewPhase } from './types';
import { sanitizeForPrompt, sanitizeLongText } from './sanitization';

/**
 * Build the dynamic system prompt for Mistral AI
 * This makes the AI behave like a recruiter from the specific company
 * 
 * SECURED: Sanitizes all user inputs to prevent prompt injection
 */
export function buildSystemPrompt(
    application: Application,
    session: InterviewSession
): string {
    // Sanitize all user-provided inputs
    const companyName = sanitizeForPrompt(application.company_name);
    const jobTitle = sanitizeForPrompt(application.job_title);
    const cultureSummary = sanitizeLongText(application.company_culture_summary || '');
    const recentNews = sanitizeLongText(application.recent_company_news || '');
    const vacancyText = sanitizeLongText(application.vacancy_text || '');

    const cultureTone = inferToneFromCulture(cultureSummary);

    return `
Je bent een professionele recruiter van ${companyName}.
Je voert een sollicitatiegesprek voor de functie: ${jobTitle}.

## JOUW KENNIS VAN HET BEDRIJF

**Bedrijfscultuur:** ${cultureSummary || 'Gegevens worden nog verzameld'}

**Recent Nieuws:** ${recentNews || 'Geen recent nieuws beschikbaar'}

**Vacature Details:** ${vacancyText.slice(0, 500) || 'Algemene functieomschrijving'}

## GEDRAGSREGELS

1. **Toon & Stijl:** ${cultureTone}
2. **Company Insider:** Gedraag je als een echte medewerker. Verwijs subtiel naar bedrijfswaarden en recent nieuws.
3. **Training Focus:** Dit is een TRAINING. Wees kritisch maar constructief. Help de kandidaat beter te worden.
4. **Huidige Fase:** ${session.current_phase}

## FASE-SPECIFIEKE INSTRUCTIES

${getPhaseInstructions(session.current_phase)}

## BELANGRIJKE REGELS

- **Korte vragen ONLY:** Max 1-2 zinnen per vraag. GEEN uitleg of context in de vraag.
- **Geen antwoordhints:** Geef NOOIT voorbeelden of suggesties in je vraag. Laat de kandidaat zelf denken.
- **Direct en menselijk:** Praat zoals een echte recruiter. Geen AI-achtige uitweidingen.
- **1 vraag per keer:** Stel 1 concrete vraag. Stop direct na het vraagteken.
- **Snelle feedback:** Geef feedback in max 2 zinnen: 1 compliment + 1 vraag/verdieping.
- **Nederlands:** Spreek Nederlands tenzij de kandidaat Engels praat.

VOORBEELDEN VAN GOEDE VRAGEN:
✅ "Vertel eens over je recente projectervaring."
✅ "Hoe ga je om met deadlines?"
✅ "Waarom ${application.company_name}?"

VOORBEELDEN VAN SLECHTE VRAGEN (VERMIJD DIT!):
❌ "Kun je een voorbeeld geven van wanneer je in een team hebt gewerkt, misschien een project waarbij je moest samenwerken met verschillende afdelingen?"
❌ "Wat zijn je sterke punten? Denk bijvoorbeeld aan communicatie, leiderschap, of probleemoplossend vermogen."
`.trim();
}

/**
 * Infer communication tone from company culture
 */
function inferToneFromCulture(cultureSummary?: string): string {
    if (!cultureSummary) {
        return 'Professioneel en vriendelijk';
    }

    const lower = cultureSummary.toLowerCase();

    if (lower.includes('informeel') || lower.includes('startup') || lower.includes('casual')) {
        return 'Informeel en direct. Spreek de kandidaat aan met "je". Gebruik af en toe humor.';
    }

    if (lower.includes('formeel') || lower.includes('traditioneel') || lower.includes('conservatief')) {
        return 'Formeel en respectvol. Spreek de kandidaat aan met "u". Houd een professionele afstand.';
    }

    if (lower.includes('innovatie') || lower.includes('tech') || lower.includes('modern')) {
        return 'Modern en energiek. Spreek de kandidaat aan met "je". Focus op innovatie en toekomst.';
    }

    return 'Professioneel en vriendelijk. Mix van formeel en informeel.';
}

/**
 * Get instructions specific to the current interview phase
 */
function getPhaseInstructions(phase: InterviewPhase): string {
    switch (phase) {
        case 'INTRO':
            return `
**INTRO FASE:**
- Verwelkom de kandidaat warm
- Stel jezelf kort voor (naam + rol)
- Leg uit hoe het gesprek gaat verlopen (max 2 zinnen)
- Eindigen met: "Laten we beginnen. Vertel eens..."
`;

        case 'ASK':
            return `
**VRAAG FASE:**
- Stel 1 korte, directe vraag (max 10 woorden!)
- Focus: functie-eisen, bedrijfscultuur, of ervaring
- GEEN voorbeelden of hints in de vraag
- Stop direct na het vraagteken

Voorbeelden:
- "Vertel over je grootste professionele uitdaging."
- "Hoe ga je om met conflicten in een team?"
- "Waarom past deze rol bij jou?"
`;

        case 'ANSWER':
            return `
**LUISTER FASE:**
- De kandidaat geeft nu zijn/haar antwoord
- Luister actief en noteer sterke en zwakke punten
- Ga daarna naar FEEDBACK fase
`;

        case 'FEEDBACK':
            return `
**FEEDBACK FASE:**
- Geef ultra-kort feedback (max 15 woorden totaal!)
- Format: "[Compliment]. [Doorvraag/Verdieping]?"
- Voorbeelden:
  * "Goed voorbeeld. Wat was het resultaat?"
  * "Duidelijk verhaal. Hoe reageerde je team?"
  * "Interessant. En toen?"
`;

        case 'SUMMARY':
            return `
**AFSLUIT FASE:**
- Bedank de kandidaat voor het gesprek
- Geef een korte overall beoordeling (2-3 zinnen)
- Noem 2-3 concrete verbeterpunten
- Eindig positief en motiverend
`;

        case 'COMPLETED':
            return 'Het gesprek is afgerond. Bedank de kandidaat.';

        default:
            return '';
    }
}

/**
 * Determine next phase based on current phase and context
 */
export function getNextPhase(
    currentPhase: InterviewPhase,
    questionCount: number
): InterviewPhase {
    switch (currentPhase) {
        case 'INTRO':
            return 'ASK';

        case 'ASK':
            return 'ANSWER';

        case 'ANSWER':
            return 'FEEDBACK';

        case 'FEEDBACK':
            // After 12 questions, move to summary for proper closure
            // Increased from 5 to allow realistic interview practice
            if (questionCount >= 12) {
                return 'SUMMARY';
            }
            return 'ASK';

        case 'SUMMARY':
            return 'COMPLETED';

        default:
            return currentPhase;
    }
}
