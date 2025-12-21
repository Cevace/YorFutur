import { reader } from '@/lib/keystatic';
import { notFound } from 'next/navigation';
import HeroBlock from '@/components/blocks/HeroBlock';
import StatsBlock from '@/components/blocks/StatsBlock';
import PricingBlock from '@/components/blocks/PricingBlock';
import CallToActionBlock from '@/components/blocks/CallToActionBlock';
import TextBlock from '@/components/blocks/TextBlock';
import ImageTextBlock from '@/components/blocks/ImageTextBlock';
import CardGridBlock from '@/components/blocks/CardGridBlock';
import FaqBlock from '@/components/blocks/FaqBlock';

export async function generateStaticParams() {
    const pages = await reader.collections.pages.all();
    return pages.map((page) => ({
        slug: page.slug,
    }));
}

export default async function LandingPage({ params }: { params: { slug: string } }) {
    const page = await reader.collections.pages.read(params.slug);

    if (!page) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            {page.content.map((block, index) => {
                switch (block.discriminant) {
                    case 'hero':
                        return <HeroBlock key={index} data={block.value} />;
                    case 'stats':
                        return <StatsBlock key={index} data={block.value} />;
                    case 'pricing':
                        return <PricingBlock key={index} data={block.value} />;
                    case 'callToAction':
                        return <CallToActionBlock key={index} data={block.value} />;
                    case 'textBlock':
                        return <TextBlock key={index} data={block.value} />;
                    case 'imageText':
                        return <ImageTextBlock key={index} data={block.value} />;
                    case 'cardGrid':
                        return <CardGridBlock key={index} data={block.value} />;
                    case 'faq':
                        return <FaqBlock key={index} data={block.value} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
