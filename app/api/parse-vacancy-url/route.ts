import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@/utils/supabase/server';

/**
 * Parse vacancy URL to extract title and full text
 * Uses Browserless for JavaScript-rendered content + Mistral AI for extraction
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is verplicht' }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Ongeldige URL format' }, { status: 400 });
        }

        // 1. Fetch HTML content via Browserless
        const browserlessApiKey = process.env.BROWSERLESS_API_KEY;
        if (!browserlessApiKey) {
            console.error('BROWSERLESS_API_KEY not configured');
            return NextResponse.json({
                error: 'Server configuratie fout. Neem contact op met support.'
            }, { status: 500 });
        }

        console.log('[ParseVacancyURL] Fetching:', url);

        const browserlessResponse = await fetch(
            `https://chrome.browserless.io/content?token=${browserlessApiKey}&stealth=true`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                body: JSON.stringify({
                    url
                })
            }
        );

        if (!browserlessResponse.ok) {
            console.error('Browserless error:', browserlessResponse.status, await browserlessResponse.text());
            return NextResponse.json({
                error: `De pagina blokkeert de toegang (${browserlessResponse.status}). Probeer de tekst handmatig te kopiëren.`
            }, { status: 500 });
        }

        const htmlContent = await browserlessResponse.text();

        // Check for Cloudflare/Captcha
        if (htmlContent.includes('challenge-platform') ||
            htmlContent.includes('cf-turnstile') ||
            htmlContent.includes('Verifying you are human') ||
            htmlContent.includes('ben je een mens')) {
            return NextResponse.json({
                error: 'Deze website (bijv. Indeed) blokkeert automatische toegang. Kopieer de tekst handmatig.'
            }, { status: 400 });
        }

        if (!htmlContent || htmlContent.length < 100) {
            return NextResponse.json({
                error: 'Pagina bevat te weinig inhoud. Is dit een geldige vacature-pagina?'
            }, { status: 400 });
        }

        // 2. Extract vacancy data via Mistral AI
        const mistralApiKey = process.env.MISTRAL_API_KEY;
        if (!mistralApiKey) {
            console.error('MISTRAL_API_KEY not configured');
            return NextResponse.json({
                error: 'AI service niet beschikbaar'
            }, { status: 500 });
        }

        const client = new Mistral({ apiKey: mistralApiKey });

        const prompt = `
Je bent een AI assistent die vacaturepagina's analyseert.
Extraheer uit de volgende HTML de vacature informatie:

1. **Vacature Titel/Functienaam**: De exacte titel van de functie
2. **Volledige Vacaturetekst**: Alle relevante tekst inclusief:
   - Functieomschrijving
   - Verantwoordelijkheden
   - Eisen en vereisten
   - Wat wordt aangeboden
   - Bedrijfsinformatie

BELANGRIJK:
- Extraheer ALLEEN de vacature content, geen navigatie, footer, of andere pagina-elementen
- Behoud structuur en formattering waar relevant
- Als er meerdere vacatures op de pagina staan, kies de meest prominente
- Als er GEEN vacature te vinden is, geef dan een duidelijke error

HTML (eerste 15000 karakters):
${htmlContent.substring(0, 15000)}

Antwoord in JSON formaat:
{
  "success": true/false,
  "title": "Exacte functietitel",
  "text": "Volledige vacaturetekst met alle details",
  "error": "Foutmelding als success=false"
}
`;

        const chatResponse = await client.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' }
        });

        const content = chatResponse.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            throw new Error('Geen response van AI');
        }

        const result = JSON.parse(content);

        if (!result.success) {
            return NextResponse.json({
                error: result.error || 'Kon geen vacature vinden op deze pagina'
            }, { status: 400 });
        }

        if (!result.title || !result.text) {
            return NextResponse.json({
                error: 'Incomplete vacature data gevonden'
            }, { status: 400 });
        }

        console.log('[ParseVacancyURL] Success:', result.title);

        return NextResponse.json({
            success: true,
            data: {
                title: result.title,
                text: result.text
            }
        });

    } catch (error: any) {
        console.error('Parse vacancy URL error:', error);
        return NextResponse.json({
            error: error.message || 'Er ging iets mis bij het verwerken van de URL'
        }, { status: 500 });
    }
}
