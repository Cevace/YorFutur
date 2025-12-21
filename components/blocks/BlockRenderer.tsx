import Hero from './Hero';
import TextBlock from './TextBlock';
import SuccessStoriesBlock from './SuccessStoriesBlock';
import ImageTextBlock from './ImageTextBlock';
import CardGridBlock from './CardGridBlock';
import StatsBlock from './StatsBlock';
import LogoGridBlock from './LogoGridBlock';
import CallToActionBlock from './CallToActionBlock';
import PricingBlock from './PricingBlock';
import ContactFormBlock from './ContactFormBlock';
import FaqBlock from './FaqBlock';

interface BlockRendererProps {
    blocks: readonly any[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
    if (!blocks) return null;

    return (
        <>
            {blocks.map((block, index) => {
                switch (block.discriminant) {
                    case 'hero':
                        return <Hero key={index} {...block.value} />;
                    case 'textBlock':
                        return <TextBlock key={index} data={block.value} />;
                    case 'successStories':
                        return <SuccessStoriesBlock key={index} {...block.value} />;
                    case 'imageText':
                        return <ImageTextBlock key={index} data={block.value} />;
                    case 'cardGrid':
                        return <CardGridBlock key={index} data={block.value} />;
                    case 'stats':
                        return <StatsBlock key={index} data={block.value} />;
                    case 'logoGrid':
                        return <LogoGridBlock key={index} {...block.value} />;
                    case 'callToAction':
                        return <CallToActionBlock key={index} data={block.value} />;
                    case 'pricing':
                        return <PricingBlock key={index} data={block.value} />;
                    case 'contactForm':
                        return <ContactFormBlock key={index} {...block.value} />;
                    case 'faq':
                        return <FaqBlock key={index} data={block.value} />;
                    default:
                        return null;
                }
            })}
        </>
    );
}
