import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import { overwriteProfileData, type ParsedProfileData } from '@/actions/profile';

/**
 * NEW: Parse CV and extract structured profile data (experiences + education)
 * Supports both PDF and DOCX files
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { storagePath } = body;

        if (!storagePath) {
            return NextResponse.json({ error: 'Missing storage path' }, { status: 400 });
        }

        // 1. Download the CV from storage
        const lowerPath = storagePath.toLowerCase();
        const isPDF = lowerPath.endsWith('.pdf');
        const isDOCX = lowerPath.endsWith('.docx');

        if (!isPDF && !isDOCX) {
            return NextResponse.json({
                error: 'We ondersteunen alleen PDF en Word (.docx) bestanden.'
            }, { status: 400 });
        }

        const { data, error: downloadError } = await supabase.storage.from('cvs').download(storagePath);

        if (downloadError || !data) {
            console.error('Storage download error:', downloadError);
            return NextResponse.json({
                error: 'Kon het CV bestand niet ophalen uit storage.'
            }, { status: 500 });
        }

        // 2. Extract text from PDF or DOCX
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let cvText = '';

        if (isPDF) {
            // Extract from PDF using pdf2json
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
        } else {
            // Extract from DOCX using mammoth
            try {
                const result = await mammoth.extractRawText({ buffer });
                cvText = result.value;
            } catch (e: any) {
                console.error('DOCX parse error:', e);
                return NextResponse.json({
                    error: `Kon de tekst niet uit het Word bestand lezen: ${e.message || e}`
                }, { status: 500 });
            }
        }

        // 3. Extract structured profile data via Mistral AI
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            console.error('No MISTRAL_API_KEY found');
            return NextResponse.json({
                error: 'Configuratie fout: Geen AI API key gevonden. Neem contact op met support.'
            }, { status: 500 });
        }

        const client = new Mistral({ apiKey: apiKey });

        const prompt = `
        Je bent een AI assistent die CV's analyseert en gestructureerde data extraheert.
        Analyseer het volgende CV en extraheer ALLE informatie.

        KRITIEKE INSTRUCTIES:

        1. WERKERVARING - VOLLEDIGE BESCHRIJVINGEN:
           - Extraheer de VOLLEDIGE beschrijving voor elke rol
           - Dit omvat: de inleidende paragraaf EN ALLE bullet points
           - Bewaar newlines en formatting (gebruik \\n voor nieuwe regels)
           - STOP NIET bij de eerste regel of eerste bullet
           - Neem ALLE verantwoordelijkheden en prestaties op

        2. OPLEIDINGEN - INCLUSIEF CERTIFICATEN:
           - Extraheer ZOWEL formele opleidingen (Universiteiten, Hogescholen)
           - ALS certificaten (Google, Scrum, Meta, AWS, etc.)
           - Voor certificaten: school = organisatie, degree = "Certificate", field_of_study = certificaatnaam

        3. CONTACTGEGEVENS:
           - Extraheer: naam, email, telefoon, stad, land, LinkedIn URL
           - Zoek naar deze informatie bovenaan het CV

        4. SAMENVATTING:
           - Extraheer de Executive Summary of professionele bio (meestal bovenaan)

        5. TALEN:
           - Extraheer alle genoemde talen met niveau
           - Map niveau naar: Moedertaal, Vloeiend, Goed, of Basis

        6. SKILLS:
           - Voor elke baan: 3-5 relevante hard skills/tools

        7. DATUMS:
           - Formaat: YYYY-MM-DD (gebruik YYYY-MM-01 als alleen maand/jaar bekend)
           - Als baan actueel is: end_date = null, is_current = true

        CV TEKST:
        ${cvText.substring(0, 10000)}

        Geef antwoord in puur JSON formaat (geen markdown, geen backticks) met deze EXACTE structuur:
        {
            "contact": {
                "first_name": "Voornaam",
                "last_name": "Achternaam",
                "email": "email@example.com",
                "phone": "+31612345678",
                "city": "Amsterdam",
                "country": "Nederland",
                "linkedin_url": "https://linkedin.com/in/..."
            },
            "summary": "Executive summary of professionele bio van de kandidaat",
            "experiences": [
                {
                    "company": "Bedrijfsnaam",
                    "job_title": "Functietitel",
                    "location": "Stad, Land",
                    "start_date": "YYYY-MM-DD",
                    "end_date": "YYYY-MM-DD of null",
                    "is_current": false,
                    "description": "VOLLEDIGE beschrijving inclusief inleiding en ALLE bullet points. Gebruik \\n voor nieuwe regels. Neem ALLES op.",
                    "skills": ["Skill1", "Skill2", "Skill3"]
                }
            ],
            "educations": [
                {
                    "school": "Onderwijsinstelling of Certificerende Organisatie",
                    "degree": "Diploma/Graad of Certificate",
                    "field_of_study": "Studierichting of Certificaatnaam",
                    "start_date": "YYYY-MM-DD",
                    "end_date": "YYYY-MM-DD"
                }
            ],
            "languages": [
                {
                    "language": "Nederlands",
                    "proficiency": "Moedertaal"
                },
                {
                    "language": "English",
                    "proficiency": "Vloeiend"
                }
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

        const profileData: ParsedProfileData = JSON.parse(content);

        // 4. Overwrite existing profile data with new parsed data
        const result = await overwriteProfileData(profileData);

        if (!result.success) {
            throw new Error(result.error || 'Failed to save profile data');
        }

        return NextResponse.json({
            success: true,
            message: 'Profiel succesvol bijgewerkt',
            data: {
                experiencesCount: profileData.experiences.length,
                educationsCount: profileData.educations.length
            }
        });

    } catch (error: any) {
        console.error('Parse Profile API error:', error);
        return NextResponse.json({
            error: `CV verwerking mislukt: ${error.message}`
        }, { status: 500 });
    }
}
