import { CVData, AuditResult } from './types';

const SIMULATE_API_DELAY = 1500;

/**
 * Mock service for AI text rewriting
 * TODO: Replace with actual Mistral AI API call
 */
export const mockRewriteService = async (
    text: string,
    context: string
): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (context === 'summary') {
                resolve(
                    "Gedreven Sales Manager met bewezen expertise in B2B-relatiebeheer en strategische acquisitie. Expert in het vertalen van klantbehoeften naar passende softwareoplossingen, resulterend in een consistente omzetgroei en hoge klanttevredenheid."
                );
            } else if (context === 'experience' || context === 'description') {
                resolve(
                    "Verantwoordelijk voor het beheer van de volledige verkoopcyclus voor zakelijke softwarelicenties. Succesvol in het genereren van nieuwe leads via cold calling en netwerkevenementen, wat leidde tot een omzetstijging van 15% in het eerste jaar."
                );
            } else {
                resolve(text + " (Verbeterd door Cevace AI)");
            }
        }, SIMULATE_API_DELAY);
    });
};

/**
 * Mock service for ATS scanning
 * TODO: Replace with actual ATS analysis logic
 */
export const mockAtsScanService = async (data: CVData): Promise<AuditResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const issues = [];
            let score = 65;

            if (data.personal.summary.length < 50) {
                issues.push({
                    type: 'error' as const,
                    text: "Je profieltekst is te kort voor ATS systemen.",
                    field: 'summary',
                });
                score -= 10;
            }

            if (data.skills.length < 5) {
                issues.push({
                    type: 'warning' as const,
                    text: "Voeg minimaal 5 relevante vaardigheden toe.",
                    field: 'skills',
                });
                score -= 5;
            }

            const hasAction = data.experience.some(
                (e) =>
                    e.description.toLowerCase().includes('verantwoordelijk') ||
                    e.description.toLowerCase().includes('succesvol')
            );

            if (!hasAction) {
                issues.push({
                    type: 'warning' as const,
                    text: "Gebruik krachtige actiewoorden in je werkervaring (bijv. 'Gerealiseerd', 'Geleid').",
                    field: 'experience',
                });
                score -= 10;
            }

            resolve({ score, issues });
        }, SIMULATE_API_DELAY);
    });
};
