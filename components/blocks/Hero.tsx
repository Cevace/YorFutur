import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
}

export default function Hero({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroProps) {
    return (
        <section className="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden">
            {/* Background Image or Gradient Fallback */}
            <div className="absolute inset-0 z-0">
                {backgroundImage ? (
                    <Image
                        src={backgroundImage}
                        alt="Hero background"
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cevace-blue to-black" />
                )}
                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-cevace-orange/20 text-cevace-orange text-sm font-bold mb-6 border border-cevace-orange/50 backdrop-blur-sm">
                    NIEUW
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                    {headline}
                </h1>
                <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-gray-200 font-light">
                    {subheadline}
                </p>
                {ctaText && ctaLink && (
                    <Link
                        href={ctaLink}
                        className="inline-block bg-cevace-orange text-white font-bold text-lg py-4 px-10 rounded-full hover:bg-orange-600 hover:scale-105 transition-all shadow-lg shadow-orange-500/30"
                    >
                        {ctaText}
                    </Link>
                )}
            </div>
        </section>
    );
}
