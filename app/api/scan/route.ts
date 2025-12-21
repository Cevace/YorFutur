import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { storagePath, vacancyText } = body;

        if (!storagePath || !vacancyText) {
            return NextResponse.json({ error: 'Missing storage path or vacancy text' }, { status: 400 });
        }

        // 1. Download the CV from storage
        if (!storagePath.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({
                error: 'Op dit moment ondersteunen we alleen PDF bestanden.'
            }, { status: 400 });
        }

        const { data, error: downloadError } = await supabase.storage.from('cvs').download(storagePath);

        if (downloadError || !data) {
            console.error('Storage download error:', downloadError);
            return NextResponse.json({
                error: 'Kon het CV bestand niet ophalen uit storage.'
            }, { status: 500 });
        }

        // 2. Extract text from PDF using pdf2json
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let cvText = '';
        try {
            cvText = await new Promise<string>((resolve, reject) => {
                const pdfParser = new (PDFParser as any)(null, true);

                pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                    try {
                        // Extract text from all pages with safe URI decoding
                        const text = pdfData.Pages.map((page: any) =>
                            page.Texts.map((textItem: any) =>
                                textItem.R.map((run: any) => {
                                    try {
                                        return decodeURIComponent(run.T);
                                    } catch {
                                        return run.T; // Fallback to raw text if URI decoding fails
                                    }
                                }).join('')
                            ).join(' ')
                        ).join('\n');
                        resolve(text);
                    } catch (e) {
                        reject(e);
                    }
                });

                pdfParser.on('pdfParser_dataError', (err: Error) => {
                    reject(err);
                });

                pdfParser.parseBuffer(buffer);
            });
        } catch (e: any) {
            console.error('PDF parse error:', e);
            return NextResponse.json({
                error: `Kon de tekst niet uit het PDF bestand lezen: ${e.message || e}`
            }, { status: 500 });
        }

        // 3. Perform Analysis via Mistral AI
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            console.error('No MISTRAL_API_KEY found');
            return NextResponse.json({
                error: 'Configuratie fout: Geen AI API key gevonden. Neem contact op met support.'
            }, { status: 500 });
        }

        const client = new Mistral({ apiKey: apiKey });

        const prompt = `
        Je bent een strenge, kritische corporate recruiter bij een topbedrijf (Google/Meta niveau).
        Analyseer het volgende CV op basis van de vacaturetekst.
        Wees eerlijk, direct en niet te lief. Zoek naar de "rode vlaggen" en "gaten".

        BELANGRIJK: Geef al je feedback VOLLEDIG IN HET NEDERLANDS. Alle teksten in je antwoord moeten in correct Nederlands zijn.

        VACATURE:
        ${vacancyText.substring(0, 2000)}

        CV TEKST:
        ${cvText.substring(0, 3000)}

        Geef antwoord in puur JSON formaat (geen markdown, geen backticks) met deze structuur.
        LET OP: Alle "text" velden moeten in het NEDERLANDS zijn:
        {
            "score": (getal 0-100),
            "feedback": [
                { "type": "positive", "text": "Kort positief punt in het Nederlands" },
                { "type": "improvement", "text": "Kort verbeterpunt in het Nederlands" },
                { "type": "improvement", "text": "Nog een verbeterpunt in het Nederlands" },
                { "type": "info", "text": "Recruiter Memo: Jouw ongezouten mening over deze kandidaat in 1-2 zinnen, in het Nederlands." }
            ]
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

        const result = JSON.parse(content);

        // 4. Save scan to DB
        await supabase.from('scans').insert({
            user_id: user.id,
            cv_url: storagePath,
            vacancy_text: vacancyText,
            match_score: result.score,
            analysis_result: result.feedback
        });

        return NextResponse.json({
            score: result.score,
            feedback: result.feedback
        });

    } catch (error: any) {
        console.error('Scan API error:', error);
        return NextResponse.json({
            error: `AI Analyse mislukt: ${error.message}`
        }, { status: 500 });
    }
}
