'use server';

import { createClient } from '@/utils/supabase/server';

// Job result type
export type JobResult = {
    id: string;
    title: string;
    company: string;
    location: string;
    snippet: string;
    postedDate: string;
    url: string;
    sector?: string;
};

export type PitchResult = {
    pitchType: 'CAREER_PIVOT' | 'SUPPORT' | 'STRATEGIC';
    pitchText: string;
};

// BLACKLIST: Job aggregators & recruitment platforms to exclude
// We want ONLY direct company career pages, not job boards
const BLACKLIST = [
    // Major International Job Boards
    'indeed', 'linkedin', 'glassdoor', 'monster', 'stepstone',

    // Dutch Job Boards (Groot)
    'nationalevacaturebank', 'werk.nl', 'uwv.nl', 'jobbird', 'monsterboard',
    'intermediair', 'youngcapital', 'randstad', 'tempo-team', 'unique',
    'start.nl', 'werkzoeken.nl', 'vacature.com', 'vacat.nl', 'vacatures.nl',
    'jobat.nl', 'jouwictvacature', 'ictergezocht', 'itjobs', 'jobrapido',

    // Dutch Job Boards (Kleinere)
    'sollicitatiedokter', 'banenzoekmachine', 'meesterbaan', 'onderwijsvacaturebank',
    'zorgvacatures', 'zorgwerk', 'carrieretijger', 'cv.nl', 'solliciteer.net',
    'debanensite', 'werkgever.nl', 'freelance.nl', 'flexnieuws', 'uitzendbureau',

    // Recruitment Agencies
    'hays', 'brunel', 'yacht', 'manpower', 'adecco', 'olympia', 'timing',
    'onderwijs-vacatures', 'detachering', 'payroll', 'uitzenden',

    // International Aggregators
    'careerjet', 'jooble', 'adzuna', 'neuvoo', 'lensa', 'ziprecruiter',
    'simplyhired', 'jobrapido', 'jobted', 'talent.com', 'lensa.com',
    'getwork', 'snagajob', 'recruit', 'jobbatical', 'remoteok',

    // Generic Indicators (URL patterns) - but NOT werkenbij which is good!
    'vacaturebank', 'jobboard', 'banen.', 'banenplein',
    '/jobs/', '/vacatures/',

    // News/Content Sites
    'nieuws', 'blog', 'artikel', 'magazine', 'newspaper'
];

// Mock job data for realistic UI testing
// TODO: Replace with real search API (Serper.dev or Bing Search API)
const MOCK_JOBS: JobResult[] = [
    {
        id: '1',
        title: 'Sales Manager B2B',
        company: 'Technische Unie',
        location: 'Utrecht',
        snippet: 'Ben jij een gedreven salesmanager met technische affiniteit? Wij zoeken een Sales Manager voor onze groothandel in technische installatiematerialen.',
        postedDate: '2 dagen geleden',
        url: 'https://werkenbij.technischeunie.nl/sales-manager',
        sector: 'techniek'
    },
    {
        id: '2',
        title: 'Accountmanager',
        company: 'Grolsch Bierbrouwerij',
        location: 'Enschede',
        snippet: 'Voor onze regio Oost-Nederland zijn wij op zoek naar een commercieel talent die onze Horeca klanten verder helpt groeien.',
        postedDate: '4 dagen geleden',
        url: 'https://werkenbij.grolsch.nl/accountmanager-horeca',
        sector: 'zakelijk'
    },
    {
        id: '3',
        title: 'Marketing Coördinator',
        company: 'Bakker Bart',
        location: 'Amsterdam',
        snippet: 'Ben jij creatief en houd je van de dynamiek van retail? Kom ons marketingteam versterken en zorg ervoor dat heel Nederland van onze broodjes gaat houden.',
        postedDate: '1 week geleden',
        url: 'https://werkenbij.bakkerbart.nl/marketing',
        sector: 'horeca'
    },
    {
        id: '4',
        title: 'Projectleider Bouw',
        company: 'Van Wijnen',
        location: 'Rotterdam',
        snippet: 'Wij zijn op zoek naar een ervaren projectleider voor woningbouwprojecten. Je bent verantwoordelijk voor de realisatie van duurzame woonwijken.',
        postedDate: '3 dagen geleden',
        url: 'https://werkenbij.vanwijnen.nl/projectleider',
        sector: 'bouw'
    },
    {
        id: '5',
        title: 'Logistiek Coördinator',
        company: 'Sligro Food Group',
        location: 'Veghel',
        snippet: 'Voor ons distributiecentrum zoeken wij een hands-on logistiek coördinator die processen optimaliseert en ons team aanstuurt.',
        postedDate: '5 dagen geleden',
        url: 'https://werkenbij.sligro.nl/logistiek',
        sector: 'logistiek'
    },
    {
        id: '6',
        title: 'Verpleegkundige Thuiszorg',
        company: 'Cordaan',
        location: 'Amsterdam',
        snippet: 'Maak het verschil in het leven van ouderen. Wij zoeken een gedreven verpleegkundige voor onze thuiszorgorganisatie.',
        postedDate: '1 dag geleden',
        url: 'https://werkenbij.cordaan.nl/verpleegkundige',
        sector: 'zorg'
    },
    {
        id: '7',
        title: 'Installatiemonteur',
        company: 'Imtech',
        location: 'Den Haag',
        snippet: 'Technisch talent gezocht! Als installatiemonteur werk je aan innovatieve klimaatoplossingen bij bedrijven door heel Nederland.',
        postedDate: '6 dagen geleden',
        url: 'https://werkenbij.imtech.nl/monteur',
        sector: 'techniek'
    },
    {
        id: '8',
        title: 'HR Adviseur',
        company: 'PostNL',
        location: 'Den Haag',
        snippet: 'Wil jij een strategische HR-rol bij een van de grootste werkgevers van Nederland? Wij zoeken een HR Adviseur voor onze regio Zuid-Holland.',
        postedDate: '2 weken geleden',
        url: 'https://werkenbij.postnl.nl/hr-adviseur',
        sector: 'zakelijk'
    }
];

// Helper: Check if a result should be blacklisted
function isBlacklisted(result: any): boolean {
    const url = result.link?.toLowerCase() || '';
    const title = result.title?.toLowerCase() || '';

    return BLACKLIST.some(banned =>
        url.includes(banned) || title.includes(banned)
    );
}

// Internal search function (reusable for Cron Jobs)
export async function searchJobsInternal(
    query: string,
    location: string,
    sector: string,
    freshness: '24h' | '3days' | '7days',
    apiKey?: string
): Promise<{ success: boolean; data?: JobResult[]; error?: string }> {
    try {
        // Use real Serper API if key is available
        if (apiKey) {
            try {
                // Build sector keywords
                const sectorKeywords: Record<string, string> = {
                    'techniek': 'installatie OR elektrotechniek',
                    'bouw': 'bouw OR aannemer',
                    'logistiek': 'logistiek OR transport',
                    'zakelijk': 'dienstverlening OR consultancy',
                    'zorg': 'zorg OR gezondheidszorg',
                    'horeca': 'horeca OR restaurant',
                    'alles': ''
                };

                // Build SIMPLE search query - Serper doesn't like complex queries
                const locationPart = location && location !== 'Nederland' ? location : '';
                const sectorPart = sectorKeywords[sector] || '';

                // Simple query format that Serper accepts
                const searchQuery = [
                    query,
                    locationPart,
                    'vacature',
                    sectorPart
                ].filter(Boolean).join(' ');

                // Map freshness to Google TBS (Time By Search) parameter
                const tbsMapping: Record<string, string> = {
                    '24h': 'qdr:d',
                    '3days': 'qdr:d3',
                    '7days': 'qdr:w'
                };
                const tbs = tbsMapping[freshness] || 'qdr:w';

                // Call Serper API
                console.log('[Job Radar] Calling Serper API with query:', searchQuery.substring(0, 100) + '...');
                console.log('[Job Radar] API Key present:', !!apiKey, 'Length:', apiKey?.length);

                const response = await fetch('https://google.serper.dev/search', {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        q: searchQuery,
                        num: 50, // Increased to 50 to prevent empty results after filtering
                        gl: 'nl',
                        hl: 'nl', // Host language (interface), but results can be international
                        tbs: tbs // CRITICAL: This enforces freshness (e.g. past 24h)
                    })
                });

                console.log('[Job Radar] Serper Response Status:', response.status, response.statusText);

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('[Job Radar] Serper API Error Body:', errorBody);
                    throw new Error(`Serper API error: ${response.status} - ${errorBody}`);
                }

                const data = await response.json();

                // Post-process results: Normalize dates and filter strictly
                const cleanResults = (data.organic || [])
                    .filter((result: any) => !isBlacklisted(result))
                    .map((result: any, index: number) => {
                        const parsedDate = parseRelativeDate(result.date); // Use new regex parser
                        return {
                            id: `serper-${index}`,
                            title: result.title || 'Vacature',
                            company: extractCompanyName(result.link) || 'Onbekend bedrijf',
                            location: extractLocation(result.snippet) || location || 'Nederland',
                            snippet: result.snippet || '',
                            postedDate: formatTimeAgo(parsedDate),
                            url: result.link,
                            sector: sector !== 'alles' ? sector : undefined,
                            rawDate: parsedDate, // Keep for filtering
                        };
                    })
                    .filter((job: any) => {
                        // 1. Exclude News/Blog content based on Title (EU Wide)
                        const titleLower = job.title.toLowerCase();

                        // Keywords in NL, EN, DE, FR, ES, IT, PL
                        const badTerms = [
                            // NL
                            'nieuws', 'blog', 'artikel', 'trends', 'report', 'aankondiging', 'lancering', 'update', 'persbericht', 'analyse',
                            // EN
                            'news', 'article', 'press release', 'digest', 'insight', 'announcement', 'launch', 'analysis', 'review',
                            // DE
                            'nachrichten', 'bericht', 'neuigkeit', 'pressemitteilung', 'aktuell',
                            // FR
                            'actualites', 'nouvelles', 'communique', 'presse', 'lancement',
                            // ES
                            'noticias', 'articulo', 'prensa', 'lanzamiento', 'novedades',
                            // IT
                            'notizie', 'stampa', 'annuncio', 'novita',
                            // Generic
                            'conference', 'webinar', 'seminar', 'symposium', 'event', 'beurs'
                        ];

                        if (badTerms.some(term => titleLower.includes(term))) return false;

                        // 2. STRICT FILTERING based on freshness
                        if (freshness === '24h') {
                            const hoursOld = (Date.now() - job.rawDate.getTime()) / (1000 * 60 * 60);
                            return hoursOld <= 30; // 30h buffer
                        }
                        if (freshness === '3days') {
                            const daysOld = (Date.now() - job.rawDate.getTime()) / (1000 * 60 * 60 * 24);
                            return daysOld <= 4; // 4 days buffer
                        }
                        return true;
                    })
                    .slice(0, 12); // Take top 12 clean results

                console.log('[Job Radar] Found', data.organic?.length || 0, 'raw results, filtered to', cleanResults.length);
                return { success: true, data: cleanResults };
            } catch (apiError) {
                console.error('Serper API failed:', apiError);
                return {
                    success: false,
                    error: 'De zoekmachine kon niet bereikt worden. Probeer het later opnieuw.'
                };
            }
        }

        // No API key available - return error instead of mock data
        console.error('SERPER_API_KEY is missing from environment variables!');
        return {
            success: false,
            error: 'Job Radar configuratie fout. Neem contact op met support.'
        };
    } catch (error) {
        console.error('Error searching jobs:', error);
        return { success: false, error: 'Er ging iets mis bij het zoeken' };
    }
}

// Search jobs action (Wrapper with Auth)
export async function searchJobsAction(
    query: string,
    location: string,
    sector: string,
    freshness: '24h' | '3days' | '7days'
): Promise<{ success: boolean; data?: JobResult[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet geautoriseerd' };
        }

        // Implicitly Save Search Preference for Cron Job
        // Note: We ignore errors here to not block the search if DB write fails
        try {
            // Check if user already has a search preference, if so update it
            // Assuming we only keep 1 active search per user for V1 simplicity
            const { error: upsertError } = await supabase
                .from('job_radar_searches')
                .delete() // Clear old searches
                .eq('user_id', user.id);

            if (!upsertError) {
                await supabase.from('job_radar_searches').insert({
                    user_id: user.id,
                    query: query,
                    location: location,
                    freshness: freshness,
                    sector: sector
                });
            }
        } catch (dbError) {
            console.error('Failed to save search preference:', dbError);
        }

        const apiKey = process.env.SERPER_API_KEY;
        const result = await searchJobsInternal(query, location, sector, freshness, apiKey);

        // Save results to job_radar_results for dashboard display
        if (result.success && result.data && result.data.length > 0) {
            try {
                // Clear old results for this user
                await supabase
                    .from('job_radar_results')
                    .delete()
                    .eq('user_id', user.id);

                // Insert new results (top 5 for dashboard)
                const dashboardRecords = result.data.slice(0, 5).map(job => ({
                    user_id: user.id,
                    job_title: job.title,
                    company: job.company,
                    location: job.location,
                    snippet: job.snippet,
                    url: job.url,
                    posted_date: job.postedDate,
                    search_query: query
                }));

                await supabase.from('job_radar_results').insert(dashboardRecords);
            } catch (saveError) {
                console.error('Failed to save results to dashboard:', saveError);
            }
        }

        return result;
    } catch (error) {
        return { success: false, error: 'Er ging iets mis' };
    }
}

// Helper functions for parsing Serper results
function extractCompanyName(url: string): string {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        const parts = domain.split('.');
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {
        return 'Bedrijf';
    }
}

function extractLocation(snippet: string): string | null {
    const cities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'];
    for (const city of cities) {
        if (snippet.includes(city)) return city;
    }
    return null;
}

// Robust, Multilingual Date Parser (EU Support)
function parseRelativeDate(dateStr?: string): Date {
    if (!dateStr) return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Fail safe

    const now = new Date();
    const str = dateStr.toLowerCase();

    // 1. Try regex for "X [unit] ago" pattern in various languages
    // Matches: "5 hours", "2 stunden", "3 jours", "10 min"
    const match = str.match(/(\d+)\s+([a-zäöüß]+)/i);

    if (match) {
        const val = parseInt(match[1]);
        const unit = match[2];

        // Multilingual Unit Mapping
        if (['hour', 'hours', 'uur', 'uren', 'stunde', 'stunden', 'heure', 'heures', 'hora', 'horas', 'ore'].some(u => unit.startsWith(u))) {
            return new Date(now.getTime() - val * 60 * 60 * 1000);
        }
        if (['min', 'minute', 'minuten', 'minuut'].some(u => unit.startsWith(u))) {
            return now; // Fresh enough
        }
        if (['day', 'days', 'dag', 'dagen', 'tag', 'tage', 'jour', 'jours', 'dia', 'dias', 'giorni'].some(u => unit.startsWith(u))) {
            return new Date(now.getTime() - val * 24 * 60 * 60 * 1000);
        }
        if (['week', 'weeks', 'weken', 'woche', 'wochen', 'semaine', 'semaines', 'semana', 'semanas', 'settimana'].some(u => unit.startsWith(u))) {
            return new Date(now.getTime() - val * 7 * 24 * 60 * 60 * 1000);
        }
    }

    // 2. Special keywords ("Yesterday", "Gestern", etc.)
    if (str.includes('gisteren') || str.includes('yesterday') || str.includes('gestern') || str.includes('hier') || str.includes('ayer')) {
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    if (str.includes('vandaag') || str.includes('today') || str.includes('heute') || str.includes('aujourd') || str.includes('hoy') || str.includes('zojuist') || str.includes('just now')) {
        return now;
    }

    // 3. Try standard parse
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // 4. Ultimate fallback (old)
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

function formatTimeAgo(date: Date): string {
    const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Zojuist';
    if (diffHours < 24) return `${Math.floor(diffHours)} uur geleden`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;

    return '1 week geleden';
}

// Generate manager search (existing function, kept for modal)
export async function findManagerAction(jobTitle: string, companyName: string): Promise<{ success: boolean; linkedInUrl?: string; error?: string }> {
    try {
        // Simple LinkedIn search URL
        const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' hiring manager')}`;
        return { success: true, linkedInUrl };
    } catch (error) {
        return { success: false, error: 'Kon manager niet vinden' };
    }
}

// Kept from original implementation
export async function generatePitch(jobTitle: string, companyName: string): Promise<{ success: boolean; data?: { pitchType: string; pitchText: string }; error?: string }> {
    // Simplified for now - you can enhance with Mistral later
    return {
        success: true,
        data: {
            pitchType: 'STRATEGIC',
            pitchText: `Beste ${companyName},\n\nAls ${jobTitle} kan ik direct waarde toevoegen aan uw organisatie. In de eerste 30 dagen zal ik mij focussen op het leren kennen van het team en processen, in dag 31-60 eerste quick wins realiseren, en in dag 61-90 een structurele verbetering doorvoeren.\n\nGraag maak ik kennis!\n\nMet vriendelijke groet`
        }
    };
}
