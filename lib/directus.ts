/**
 * Directus Client for fetching CMS content
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cevace.com/cms';

// Types matching the Keystatic types for compatibility
export interface BlogPost {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    coverImage: string | null;
    publishedDate: string | null;
    author?: string;
    published?: boolean;
    content?: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQSection {
    headline: string;
    items: FAQItem[];
}

export interface HeroData {
    badgeText: string;
    headlinePart1: string;
    headlineHighlight: string;
    headlinePart2: string;
    description: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    heroImage: string | null;
    socialProofText: string;
}

export interface Testimonial {
    slug: string;
    name: string;
    role: string;
    company: string;
    quote: string;
    photo: string | null;
    rating: number;
}

export interface Feature {
    slug: string;
    title: string;
    description: string;
    icon: string;
}

export interface SectionConfig {
    type: string;
    enabled: boolean;
    sectionTitle: string;
}

export interface AccordionTool {
    id: string | number;
    title: string;
    subtitle: string;
    description: string;
    icon_class: string;
    button_text: string;
    button_url: string;
    background_image: string | null;
    sort: number;
}

export interface QuoteData {
    text: string;
    author: string;
    role: string;
    photo: string | null;
}

// Helper to get image URL (handles both relative paths and Directus asset IDs)
function getDirectusImageUrl(imageIdOrUrl: string | null): string | null {
    if (!imageIdOrUrl) return null;

    // If it starts with http or /, it's a raw URL (legacy or external)
    if (imageIdOrUrl.startsWith('http') || imageIdOrUrl.startsWith('/')) {
        return imageIdOrUrl;
    }

    // Otherwise, assume it is a Directus File ID (UUID), construct assets URL
    return `${DIRECTUS_URL}/assets/${imageIdOrUrl}`;
}

// Fetch wrapper with caching
async function fetchDirectus<T>(endpoint: string): Promise<T | null> {
    try {
        const res = await fetch(`${DIRECTUS_URL}/items/${endpoint}`, {
            next: { revalidate: 60 }, // Cache for 60 seconds
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error(`Directus fetch error for ${endpoint}:`, res.status);
            return null;
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(`Directus fetch error for ${endpoint}:`, error);
        return null;
    }
}

// Homepage Hero
export async function getHomepageHero(): Promise<HeroData> {
    const defaults: HeroData = {
        badgeText: '🚀 AI-Powered Career Platform',
        headlinePart1: 'Land je',
        headlineHighlight: 'Droomjob',
        headlinePart2: 'met Cevace',
        description: 'AI-gestuurde tools voor CV optimalisatie, sollicitatie tracking en interview coaching.',
        ctaPrimaryText: 'Start Gratis',
        ctaPrimaryLink: '/dashboard',
        ctaSecondaryText: 'Bekijk Demo',
        heroImage: null,
        socialProofText: '2,500+ professionals vertrouwen op Cevace',
    };

    const rawData = await fetchDirectus<Array<{
        badge_text?: string;
        headline_part1?: string;
        headline_highlight?: string;
        headline_part2?: string;
        description?: string;
        cta_primary_text?: string;
        cta_primary_link?: string;
        cta_secondary_text?: string;
        hero_image?: string;
        social_proof_text?: string;
    }>>('homepage_hero');

    // Directus returns array even for singletons
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    if (!data) return defaults;

    return {
        badgeText: data.badge_text || defaults.badgeText,
        headlinePart1: data.headline_part1 || defaults.headlinePart1,
        headlineHighlight: data.headline_highlight || defaults.headlineHighlight,
        headlinePart2: data.headline_part2 || defaults.headlinePart2,
        description: data.description || defaults.description,
        ctaPrimaryText: data.cta_primary_text || defaults.ctaPrimaryText,
        ctaPrimaryLink: data.cta_primary_link || defaults.ctaPrimaryLink,
        ctaSecondaryText: data.cta_secondary_text || defaults.ctaSecondaryText,
        heroImage: getDirectusImageUrl(data.hero_image ?? null) || defaults.heroImage,
        socialProofText: data.social_proof_text || defaults.socialProofText,
    };
}


// Blog Posts
export async function getBlogPosts(limit: number = 100): Promise<BlogPost[]> {
    const data = await fetchDirectus<Array<{
        id: number;
        title: string;
        slug: string;
        category: string;
        excerpt: string;
        cover_image: string | null;
        author: string;
        published_date: string | null;
        published: boolean;
        content: string;
    }>>(`blog_posts?filter[published][_eq]=true&sort=-published_date&limit=${limit}`);

    if (!data) return [];

    return data.map(post => ({
        slug: post.slug,
        title: post.title,
        category: post.category || 'Uncategorized',
        excerpt: post.excerpt || '',
        coverImage: getDirectusImageUrl(post.cover_image) || null,
        publishedDate: post.published_date,
        author: post.author,
        published: post.published,
        content: post.content,
    }));
}

// Single Blog Post
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const data = await fetchDirectus<Array<{
        id: number;
        title: string;
        slug: string;
        category: string;
        excerpt: string;
        cover_image: string | null;
        author: string;
        published_date: string | null;
        published: boolean;
        content: string;
    }>>(`blog_posts?filter[slug][_eq]=${slug}`);

    if (!data || data.length === 0) return null;

    const post = data[0];
    return {
        slug: post.slug,
        title: post.title,
        category: post.category || 'Uncategorized',
        excerpt: post.excerpt || '',
        coverImage: getDirectusImageUrl(post.cover_image) || null,
        publishedDate: post.published_date,
        author: post.author,
        published: post.published,
        content: post.content,
    };
}

// Testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
    const data = await fetchDirectus<Array<{
        id: number;
        name: string;
        role: string;
        company: string;
        quote: string;
        photo: string | null;
        rating: number;
        sort: number;
    }>>('testimonials?sort=sort');

    if (!data) return [];

    return data.map(t => ({
        slug: t.name.toLowerCase().replace(/\s+/g, '-'),
        name: t.name,
        role: t.role || '',
        company: t.company || '',
        quote: t.quote || '',
        photo: getDirectusImageUrl(t.photo) || null,
        rating: t.rating || 5,
    }));
}

// Features
export async function getFeatures(): Promise<Feature[]> {
    const data = await fetchDirectus<Array<{
        id: number;
        title: string;
        description: string;
        icon: string;
        sort: number;
    }>>('features?sort=sort');

    if (!data) return [];

    return data.map(f => ({
        slug: f.title.toLowerCase().replace(/\s+/g, '-'),
        title: f.title,
        description: f.description || '',
        icon: f.icon || 'brain',
    }));
}

// Accordion Tools
export async function getAccordionTools(): Promise<AccordionTool[]> {
    const mockData: AccordionTool[] = [
        {
            id: 1,
            title: "AI CV Builder",
            subtitle: "Optimize & Build",
            description: "Create a professional, ATS-optimized CV in seconds with our advanced AI builder.",
            icon_class: "fa-solid fa-file-invoice",
            button_text: "Build CV",
            button_url: "/dashboard/cv-builder",
            background_image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80",
            sort: 1
        },
        {
            id: 2,
            title: "Interview Trainer",
            subtitle: "Practice Live",
            description: "Simulate real interview scenarios with our AI coach and get instant feedback.",
            icon_class: "fa-solid fa-microphone-lines",
            button_text: "Start Practice",
            button_url: "/dashboard/interview",
            background_image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80",
            sort: 2
        },
        {
            id: 3,
            title: "Motivation Generator",
            subtitle: "Write Faster",
            description: "Generate tailored motivation letters that match your style and the job description.",
            icon_class: "fa-solid fa-pen-nib",
            button_text: "Generate",
            button_url: "/dashboard/motivation",
            background_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80",
            sort: 3
        },
        {
            id: 4,
            title: "Vacancy Tracker",
            subtitle: "Stay Organized",
            description: "Keep track of all your applications in one smart dashboard. Never miss a deadline.",
            icon_class: "fa-solid fa-list-check",
            button_text: "Go to Tracker",
            button_url: "/dashboard/tracker",
            background_image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80",
            sort: 4
        },
        {
            id: 5,
            title: "LinkedIn Booster",
            subtitle: "Enhance Profile",
            description: "Get actionable insights to improve your LinkedIn profile and attract more recruiters.",
            icon_class: "fa-brands fa-linkedin",
            button_text: "Boost Profile",
            button_url: "/dashboard/linkedin",
            background_image: "https://images.unsplash.com/photo-1611944889171-4172665b072e?auto=format&fit=crop&q=80",
            sort: 5
        }
    ];

    const data = await fetchDirectus<Array<{
        id: number;
        title: string;
        subtitle: string;
        description: string;
        icon_class: string;
        button_text: string;
        button_url: string;
        background_image: string | null;
        sort: number;
    }>>('homepage_tools?sort=sort');

    // FORCE MOCK DATA if empty OR failed
    if (!data || data.length === 0) {
        console.log('Using Mock Data for Accordion Tools');
        return mockData;
    }

    return data.map(t => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle || '',
        description: t.description || '',
        icon_class: t.icon_class || 'fa-solid fa-star',
        button_text: t.button_text || 'Learn More',
        button_url: t.button_url || '#',
        background_image: getDirectusImageUrl(t.background_image),
        sort: t.sort || 0
    }));
}

// FAQ Sections
export async function getFAQSections(): Promise<FAQSection[]> {
    // Get categories
    const categories = await fetchDirectus<Array<{
        id: number;
        name: string;
        slug: string;
        sort: number;
    }>>('faq_categories?sort=sort');

    // Get items
    const items = await fetchDirectus<Array<{
        id: number;
        question: string;
        answer: string;
        category: string;
        sort: number;
    }>>('faq_items?sort=sort');

    if (!categories || !items) return [];

    // Group items by category
    const grouped = new Map<string, FAQItem[]>();
    items.forEach(item => {
        const cat = item.category || 'general';
        if (!grouped.has(cat)) {
            grouped.set(cat, []);
        }
        grouped.get(cat)!.push({
            question: item.question,
            answer: item.answer,
        });
    });

    // Create sections
    return categories.map(cat => ({
        headline: cat.name,
        items: grouped.get(cat.slug) || [],
    }));
}

// Homepage Layout
export async function getHomepageLayout(): Promise<SectionConfig[]> {
    const defaults: SectionConfig[] = [
        { type: 'hero', enabled: true, sectionTitle: '' },
        { type: 'features', enabled: true, sectionTitle: 'Tools of the Trade.' },
        { type: 'accordion', enabled: true, sectionTitle: 'Explore tools' },
        { type: 'testimonials', enabled: true, sectionTitle: 'Join the Elite.' },
        { type: 'blog', enabled: true, sectionTitle: 'Tips en informatie' },
        { type: 'faq', enabled: true, sectionTitle: 'Veelgestelde Vragen' },
    ];

    const rawData = await fetchDirectus<Array<{
        sections?: string;
    }>>('homepage_layout');

    // Directus returns array even for singletons
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    if (!data || !data.sections) return defaults;

    try {
        const sections = JSON.parse(data.sections);
        return sections.map((s: { type: string; enabled: boolean; sectionTitle?: string }) => ({
            type: s.type,
            enabled: s.enabled,
            sectionTitle: s.sectionTitle || '',
        }));
    } catch {
        return defaults;
    }
}

// Section Settings (for quote, subtitles, etc.)
export async function getSectionSettings(): Promise<{
    quoteText: string;
    quoteAuthor: string;
    quoteRole: string;
    quotePhoto: string | null;
}> {
    const defaults = {
        quoteText: 'De meeste mensen bereiden zich voor op het verleden. Cevace bereidt je voor op de toekomst van recruitment.',
        quoteAuthor: 'James V.',
        quoteRole: 'Head of Talent, TechCorp',
        quotePhoto: null as string | null,
    };

    const rawData = await fetchDirectus<Array<{
        quote_text?: string;
        quote_author?: string;
        quote_role?: string;
    }>>('section_settings');

    // Directus returns array even for singletons
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    if (!data) return defaults;

    return {
        quoteText: data.quote_text || defaults.quoteText,
        quoteAuthor: data.quote_author || defaults.quoteAuthor,
        quoteRole: data.quote_role || defaults.quoteRole,
        quotePhoto: null,
    };
}

// Company Logos (empty for now - can be added to Directus later)
export async function getCompanyLogos(): Promise<string[]> {
    return [];
}

// Quote Data (wrapper around section settings)
export async function getQuoteData(): Promise<QuoteData> {
    const settings = await getSectionSettings();
    return {
        text: settings.quoteText,
        author: settings.quoteAuthor,
        role: settings.quoteRole,
        photo: getDirectusImageUrl(settings.quotePhoto) || null,
    };
}

// Basic Page
export async function getPage(slug: string): Promise<{ title: string; content: string } | null> {
    const data = await fetchDirectus<Array<{
        title: string;
        content: string;
    }>>(`pages?filter[slug][_eq]=${slug}`);

    // Directus returns array even for singletons (or filtered lists)
    const page = Array.isArray(data) ? data[0] : (data as any);

    if (!page) return null;

    return page;
}
