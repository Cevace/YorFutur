'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY!
});

export type Company = {
    companyName: string;
    careerPageUrl: string;
};

export type PitchResult = {
    pitchType: 'CAREER_PIVOT' | 'SUPPORT' | 'STRATEGIC';
    pitchText: string;
};

// Search for top companies using Mistral AI
export async function searchCompanies(query: string, location: string): Promise<{ success: boolean; data?: Company[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet geautoriseerd' };
        }

        const prompt = `Je bent een recruitment expert. Lijst de top 10 bedrijven in ${location || 'Nederland'} die relevant zijn voor een ${query} functie.

Geef een JSON array terug met dit formaat:
[
  {
    "companyName": "Bedrijfsnaam",
    "careerPageUrl": "https://careers.bedrijf.nl" 
  }
]

BELANGRIJK:
- Gebruik alleen echte, bestaande bedrijven
- Geef alleen de URL naar hun career/jobs pagina
- Geen LinkedIn of Indeed URLs
- Return ALLEEN de JSON array, geen andere tekst`;

        const chatResponse = await mistral.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
        });

        const responseText = chatResponse.choices?.[0]?.message?.content;

        // Handle content being string or ContentChunk array
        const contentText = typeof responseText === 'string' ? responseText : '';

        // Extract JSON from response
        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return { success: false, error: 'Kon geen bedrijven vinden' };
        }

        const companies: Company[] = JSON.parse(jsonMatch[0]);

        return { success: true, data: companies };
    } catch (error) {
        console.error('Error searching companies:', error);
        return { success: false, error: 'Er ging iets mis bij het zoeken' };
    }
}

// Generate Google Dork search link with sector-based refinement
export async function generateGoogleDork(
    jobTitle: string,
    location: string,
    sector: string,
    freshness: '24h' | '3days' | '7days'
): Promise<string> {
    const now = new Date();
    let afterDate = '';

    switch (freshness) {
        case '24h':
            now.setDate(now.getDate() - 1);
            break;
        case '3days':
            now.setDate(now.getDate() - 3);
            break;
        case '7days':
            now.setDate(now.getDate() - 7);
            break;
    }

    afterDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Sector-specific keywords (The Secret Sauce)
    const sectorKeywords: Record<string, string> = {
        'techniek': '(techniek OR installatie OR elektrotechniek OR technische OR installateur)',
        'bouw': '(bouw OR aannemer OR projectontwikkeling OR constructie)',
        'logistiek': '(logistiek OR transport OR groothandel OR distributie OR supply)',
        'zakelijk': '(zakelijk OR dienstverlening OR consultancy OR advies)',
        'zorg': '(zorg OR gezondheidszorg OR thuiszorg OR verpleging OR welzijn)',
        'horeca': '(horeca OR restaurant OR hotel OR catering OR hospitality)',
        'alles': ''
    };

    // Base query for direct employer sites - focus on actual job pages
    const baseQuery = '(intitle:"vacature" OR intitle:"vacatures" OR intitle:"werken bij" OR inurl:vacatures OR inurl:werken-bij OR inurl:jobs OR inurl:careers)';

    // Job title
    const jobQuery = `"${jobTitle}"`;

    // Location
    const locationQuery = location ? `"${location}"` : '';

    // Sector context
    const sectorQuery = sectorKeywords[sector] || '';

    // === EXCLUSIONS ===

    // Job boards exclusions
    const jobBoardExclusions = '-site:indeed.com -site:linkedin.com -site:werk.nl -site:glassdoor.com -site:nationalevacaturebank.nl -site:monsterboard.nl -site:jobbird.com -site:intermediair.nl';

    // Dutch news sites exclusions
    const dutchNewsExclusions = '-site:nos.nl -site:nu.nl -site:ad.nl -site:telegraaf.nl -site:volkskrant.nl -site:nrc.nl -site:parool.nl -site:trouw.nl -site:fd.nl -site:bnr.nl -site:rtlnieuws.nl -site:rtv.nl -site:metronieuws.nl -site:at5.nl';

    // International news sites exclusions
    const intlNewsExclusions = '-site:reuters.com -site:bloomberg.com -site:bbc.com -site:theguardian.com -site:forbes.com -site:businessinsider.com -site:cnbc.com';

    // Press release platforms exclusions
    const pressReleaseExclusions = '-site:perssupport.nl -site:nieuwsbank.nl -site:prnewswire.com -site:businesswire.com -site:globenewswire.com -site:newswire.com -site:cision.com -site:pressat.co.uk -site:anp.nl';

    // Content-based exclusions (executive appointments, departures, etc.)
    const contentExclusions = '-("persbericht" OR "press release" OR "benoemd tot" OR "treedt aan als" OR "verlaat" OR "vertrekt als" OR "nieuwe CEO" OR "nieuwe CMO" OR "nieuwe CFO" OR "nieuwe directeur" OR "aan de slag als")';

    // Combine all exclusions
    const exclusions = `${jobBoardExclusions} ${dutchNewsExclusions} ${intlNewsExclusions} ${pressReleaseExclusions} ${contentExclusions}`;

    // Combine all parts
    const parts = [
        baseQuery,
        jobQuery,
        locationQuery,
        sectorQuery,
        `after:${afterDate}`,
        exclusions
    ].filter(part => part.length > 0);

    const fullQuery = parts.join(' ');

    return `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}`;
}

// Predict hiring manager title and generate LinkedIn URL
export async function predictHiringManager(jobTitle: string, companyName: string): Promise<{ success: boolean; linkedInUrl?: string; error?: string }> {
    try {
        const prompt = `Voor de functie "${jobTitle}", wat is de meest waarschijnlijke job title van de hiring manager?

Geef alleen de functietitel terug, zonder uitleg. Bijvoorbeeld: "Sales Director" of "Head of Engineering".`;

        const chatResponse = await mistral.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
        });

        const managerTitleContent = chatResponse.choices?.[0]?.message?.content;
        const managerTitle = (typeof managerTitleContent === 'string' ? managerTitleContent : '').trim();

        // Generate LinkedIn search URL
        const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(managerTitle + ' ' + companyName)}`;

        return { success: true, linkedInUrl };
    } catch (error) {
        console.error('Error predicting manager:', error);
        return { success: false, error: 'Kon manager niet voorspellen' };
    }
}

// Generate personalized pitch based on CV and job
export async function generatePitch(jobTitle: string, companyName: string): Promise<{ success: boolean; data?: PitchResult; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet geautoriseerd' };
        }

        // Get user's latest CV
        const { data: cvs } = await supabase
            .from('cvs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!cvs || cvs.length === 0) {
            return { success: false, error: 'Geen CV gevonden. Upload eerst een CV.' };
        }

        // For now, use a simple approach - in a real scenario you'd extract text from the CV
        const prompt = `Je bent een expert career coach. Analyseer de situatie en genereer een krachtige pitch.

Target functie: ${jobTitle}
Target bedrijf: ${companyName}

Analyseer welke situatie van toepassing is:

1. CAREER_PIVOT: Als de sollicitant naar een heel ander vakgebied gaat
   → Genereer een "Transferable Skills Bridge" pitch die de overdraagbare vaardigheden benadrukt

2. SUPPORT: Als het een admin/support functie is
   → Genereer een "Peace of Mind Pledge" pitch die betrouwbaarheid en probleemoplossend vermogen benadrukt

3. STRATEGIC: Als het een management/groei functie is
   → Genereer een "30-60-90 Day Plan" pitch met concrete acties voor de eerste maanden

Geef terug in dit JSON formaat:
{
  "pitchType": "CAREER_PIVOT" | "SUPPORT" | "STRATEGIC",
  "pitchText": "De volledige pitch tekst (maximaal 200 woorden, in het Nederlands)"
}`;

        const chatResponse = await mistral.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
        });

        const responseText = chatResponse.choices?.[0]?.message?.content;
        const contentText = typeof responseText === 'string' ? responseText : '';

        // Extract JSON from response
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false, error: 'Kon geen pitch genereren' };
        }

        const pitchResult: PitchResult = JSON.parse(jsonMatch[0]);

        return { success: true, data: pitchResult };
    } catch (error) {
        console.error('Error generating pitch:', error);
        return { success: false, error: 'Er ging iets mis bij het genereren van de pitch' };
    }
}

// Save job to tracker
export async function saveToTracker(
    companyName: string,
    jobTitle: string,
    pitch?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet geautoriseerd' };
        }

        const { error } = await supabase
            .from('job_applications')
            .insert({
                user_id: user.id,
                company_name: companyName,
                job_title: jobTitle,
                status: 'applied',
                pitch_text: pitch || null,
            });

        if (error) {
            console.error('Error saving to tracker:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/tracker');
        return { success: true };
    } catch (error) {
        console.error('Error saving to tracker:', error);
        return { success: false, error: 'Er ging iets mis bij het opslaan' };
    }
}

// Save search to history
export async function saveSearch(query: string, location: string, freshness: '24h' | '3days' | '7days'): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
        .from('job_radar_searches')
        .insert({
            user_id: user.id,
            query,
            location,
            freshness,
        });
}
