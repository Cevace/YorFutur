import Link from 'next/link';
import Image from 'next/image';

type HeroBlockProps = {
    data: {
        headline: string;
        subheadline: string;
        ctaText: string;
        ctaLink: string;
        backgroundImage?: string | null;
    };
};

export default function HeroBlock({ data }: HeroBlockProps) {
    return (
        <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-6">
            {data.backgroundImage && (
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src={data.backgroundImage}
                        alt=""
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="relative max-w-5xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    {data.headline}
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
                    {data.subheadline}
                </p>
                <Link
                    href={data.ctaLink}
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl"
                >
                    {data.ctaText}
                </Link>
            </div>
        </section>
    );
}
