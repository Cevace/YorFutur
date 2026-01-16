import {
    getHomepageHero,
    getBlogPosts,
    getTestimonials,
    getFeatures,
    getFAQSections,
    getHomepageLayout,
    getCompanyLogos,
    getQuoteData,
} from '@/lib/directus';
import HomePageClient from '@/app/HomePageClient';
import NavbarWrapper from '@/components/NavbarWrapper';

export default async function HomePage() {
    // Fetch all data
    const [blogPosts, faqSections, heroData, testimonials, features, layout, companyLogos, quoteData] = await Promise.all([
        getBlogPosts(),
        getFAQSections(),
        getHomepageHero(),
        getTestimonials(),
        getFeatures(),
        getHomepageLayout(),
        getCompanyLogos(),
        getQuoteData(),
    ]);

    console.log('HomePage (new route group) data fetched successfully');

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
