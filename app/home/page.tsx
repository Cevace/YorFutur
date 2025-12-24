import { reader } from '@/lib/keystatic';
import HomePageClient from '../HomePageClient';
import NavbarWrapper from '@/components/NavbarWrapper';

// Types for Keystatic data
export interface BlogPost {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    coverImage: string | null;
    publishedDate: string | null;
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

export interface QuoteData {
    text: string;
    author: string;
    role: string;
    photo: string | null;
}

// Data fetching functions
async function getBlogPosts(): Promise<BlogPost[]> {
    const posts = await reader.collections.blog.all();

    return posts
        .filter((post) => post.entry.published === true)
        .sort((a, b) => {
            const dateA = a.entry.publishedDate ? new Date(a.entry.publishedDate).getTime() : 0;
            const dateB = b.entry.publishedDate ? new Date(b.entry.publishedDate).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 6)
        .map((post) => ({
            slug: post.slug,
            title: post.entry.title,
            category: post.entry.category || 'Uncategorized',
            excerpt: post.entry.excerpt || '',
            coverImage: post.entry.coverImage || null,
            publishedDate: post.entry.publishedDate || null,
        }));
}

async function getFAQSections(): Promise<FAQSection[]> {
    // Get all FAQ items and group them by category
    const faqItems = await reader.collections.faqItems.all();
    const categories = await reader.collections.faqCategories.all();

    // Create a map of category slug to category name
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
        categoryMap.set(cat.slug, cat.entry.name || cat.slug);
    });

    // Group items by category
    const grouped = new Map<string, FAQItem[]>();
    faqItems.forEach(item => {
        const category = item.entry.category || 'general';
        if (!grouped.has(category)) {
            grouped.set(category, []);
        }
        grouped.get(category)!.push({
            question: item.entry.question || '',
            answer: item.entry.answer || '',
        });
    });

    // Convert to array of sections
    return Array.from(grouped.entries()).map(([categorySlug, items]) => ({
        headline: categoryMap.get(categorySlug) || categorySlug,
        items,
    }));
}

async function getHeroData(): Promise<HeroData> {
    const hero = await reader.singletons.homepageHero.read();

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

    if (!hero) {
        return defaults;
    }

    return {
        badgeText: hero.badgeText || defaults.badgeText,
        headlinePart1: hero.headlinePart1 || defaults.headlinePart1,
        headlineHighlight: hero.headlineHighlight || defaults.headlineHighlight,
        headlinePart2: hero.headlinePart2 || defaults.headlinePart2,
        description: hero.description || defaults.description,
        ctaPrimaryText: hero.ctaPrimaryText || defaults.ctaPrimaryText,
        ctaPrimaryLink: hero.ctaPrimaryLink || defaults.ctaPrimaryLink,
        ctaSecondaryText: hero.ctaSecondaryText || defaults.ctaSecondaryText,
        heroImage: hero.heroImage || defaults.heroImage,
        socialProofText: hero.socialProofText || defaults.socialProofText,
    };
}

async function getTestimonials(): Promise<Testimonial[]> {
    const testimonials = await reader.collections.testimonials.all();

    return testimonials
        .sort((a, b) => (a.entry.order || 0) - (b.entry.order || 0))
        .map((t) => ({
            slug: t.slug,
            name: t.entry.name,
            role: t.entry.role || '',
            company: t.entry.company || '',
            quote: t.entry.quote || '',
            photo: t.entry.photo || null,
            rating: t.entry.rating || 5,
        }));
}

async function getFeatures(): Promise<Feature[]> {
    const features = await reader.collections.features.all();

    return features
        .sort((a, b) => (a.entry.order || 0) - (b.entry.order || 0))
        .map((f) => ({
            slug: f.slug,
            title: f.entry.title,
            description: f.entry.description || '',
            icon: f.entry.icon || 'brain',
        }));
}

async function getHomepageLayout(): Promise<SectionConfig[]> {
    const layout = await reader.singletons.homepageLayout.read();

    if (!layout || !layout.sections) {
        return [
            { type: 'hero', enabled: true, sectionTitle: '' },
            { type: 'features', enabled: true, sectionTitle: 'Tools of the Trade.' },
            { type: 'testimonials', enabled: true, sectionTitle: 'Join the Elite.' },
            { type: 'blog', enabled: true, sectionTitle: 'Tips en informatie' },
            { type: 'faq', enabled: true, sectionTitle: 'Veelgestelde Vragen' },
        ];
    }

    return layout.sections.map((s) => ({
        type: s.type,
        enabled: s.enabled,
        sectionTitle: s.sectionTitle || '',
    }));
}

async function getCompanyLogos(): Promise<string[]> {
    const settings = await reader.singletons.sectionSettings.read();

    if (!settings || !settings.testimonialsLogos) {
        return [];
    }

    return (settings.testimonialsLogos || []).filter((logo): logo is string => logo !== null);
}

async function getQuoteData(): Promise<QuoteData> {
    const settings = await reader.singletons.sectionSettings.read();

    const defaults: QuoteData = {
        text: 'De meeste mensen bereiden zich voor op het verleden. Cevace bereidt je voor op de toekomst van recruitment.',
        author: 'James V.',
        role: 'Head of Talent, TechCorp',
        photo: null,
    };

    if (!settings) {
        return defaults;
    }

    return {
        text: settings.quoteText || defaults.text,
        author: settings.quoteAuthor || defaults.author,
        role: settings.quoteRole || defaults.role,
        photo: settings.quotePhoto || defaults.photo,
    };
}

export default async function HomePage() {
    const [blogPosts, faqSections, heroData, testimonials, features, layout, companyLogos, quoteData] = await Promise.all([
        getBlogPosts(),
        getFAQSections(),
        getHeroData(),
        getTestimonials(),
        getFeatures(),
        getHomepageLayout(),
        getCompanyLogos(),
        getQuoteData(),
    ]);

    return (
        <>
            <NavbarWrapper theme="dark" />
            <HomePageClient
                blogPosts={blogPosts}
                faqSections={faqSections}
                heroData={heroData}
                testimonials={testimonials}
                features={features}
                layout={layout}
                companyLogos={companyLogos}
                quoteData={quoteData}
            />
        </>
    );
}
