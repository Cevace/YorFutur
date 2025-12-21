import { reader } from '@/lib/keystatic';
import HomePageClient from './HomePageClient';
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

export interface PricingCard {
    slug: string;
    name: string;
    description: string;
    price: string;
    priceYearly: string;
    period: string;
    features: string[];
    highlight: boolean;
    buttonText: string;
    buttonLink: string;
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

async function getBlogPosts(): Promise<BlogPost[]> {
    const posts = await reader.collections.blog.all();

    return posts
        .filter((post) => post.entry.published)
        .sort((a, b) => {
            const dateA = a.entry.publishedDate || '';
            const dateB = b.entry.publishedDate || '';
            return dateB.localeCompare(dateA);
        })
        .slice(0, 7)
        .map((post) => ({
            slug: `/blog/${post.slug}`,
            title: post.entry.title,
            category: post.entry.category,
            excerpt: post.entry.excerpt || '',
            coverImage: post.entry.coverImage || null,
            publishedDate: post.entry.publishedDate,
        }));
}

async function getFAQSections(): Promise<FAQSection[]> {
    const [categories, items] = await Promise.all([
        reader.collections.faqCategories.all(),
        reader.collections.faqItems.all(),
    ]);

    // Sort categories by order
    const sortedCategories = categories.sort((a, b) => (a.entry.order || 0) - (b.entry.order || 0));

    // Group items by category
    const faqSections: FAQSection[] = sortedCategories.map((cat) => ({
        headline: cat.entry.name.replace(/-/g, ' '),
        items: items
            .filter((item) => item.entry.category === cat.slug)
            .sort((a, b) => (a.entry.order || 0) - (b.entry.order || 0))
            .map((item) => ({
                question: item.entry.question.replace(/-/g, ' '),
                answer: item.entry.answer || '',
            })),
    }));

    return faqSections.filter(section => section.items.length > 0);
}

async function getHeroData(): Promise<HeroData> {
    const heroData = await reader.singletons.homepageHero.read();

    const defaults: HeroData = {
        badgeText: 'Private Career Club',
        headlinePart1: 'Unlock your',
        headlineHighlight: 'Unfair',
        headlinePart2: 'Advantage.',
        description: 'Solliciteren is topsport. Cevace is jouw elite trainingskamp. Train IQ, optimaliseer je profiel met AI en versla de concurrentie.',
        ctaPrimaryText: 'Start 7 Dagen Gratis',
        ctaPrimaryLink: '/login',
        ctaSecondaryText: 'Bekijk Film',
        heroImage: null,
        socialProofText: 'Trusted by 2.000+ members',
    };

    if (!heroData) {
        return defaults;
    }

    return {
        badgeText: heroData.badgeText || defaults.badgeText,
        headlinePart1: heroData.headlinePart1 || defaults.headlinePart1,
        headlineHighlight: heroData.headlineHighlight || defaults.headlineHighlight,
        headlinePart2: heroData.headlinePart2 || defaults.headlinePart2,
        description: heroData.description || defaults.description,
        ctaPrimaryText: heroData.ctaPrimaryText || defaults.ctaPrimaryText,
        ctaPrimaryLink: heroData.ctaPrimaryLink || defaults.ctaPrimaryLink,
        ctaSecondaryText: heroData.ctaSecondaryText || defaults.ctaSecondaryText,
        heroImage: heroData.heroImage || defaults.heroImage,
        socialProofText: heroData.socialProofText || defaults.socialProofText,
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

async function getPricingCards(): Promise<PricingCard[]> {
    const cards = await reader.collections.pricingCards.all();

    return cards
        .sort((a, b) => (a.entry.order || 0) - (b.entry.order || 0))
        .map((c) => ({
            slug: c.slug,
            name: c.entry.name || c.slug,
            description: c.entry.description || '',
            price: c.entry.price || '',
            priceYearly: c.entry.priceYearly || c.entry.price || '',
            period: c.entry.period || '',
            features: (c.entry.features || []) as string[],
            highlight: c.entry.highlight || false,
            buttonText: c.entry.buttonText || 'Kies Plan',
            buttonLink: c.entry.buttonLink || '/login',
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
            { type: 'pricing', enabled: true, sectionTitle: 'Invest in your Future' },
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
    const [blogPosts, faqSections, heroData, testimonials, pricingCards, features, layout, companyLogos, quoteData] = await Promise.all([
        getBlogPosts(),
        getFAQSections(),
        getHeroData(),
        getTestimonials(),
        getPricingCards(),
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
                pricingCards={pricingCards}
                features={features}
                layout={layout}
                companyLogos={companyLogos}
                quoteData={quoteData}
            />
        </>
    );
}


