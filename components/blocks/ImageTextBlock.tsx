import Image from 'next/image';
import Link from 'next/link';

interface ImageTextBlockProps {
    data: {
        headline: string;
        content: string; // Changed from document to plain text
        image?: string | null;
        layout: 'left' | 'right';
        ctaText?: string;
        ctaLink?: string;
    };
}

export default function ImageTextBlock({ data }: ImageTextBlockProps) {
    const { headline, content, image, layout = 'left', ctaText, ctaLink } = data;
    const isLeft = layout === 'left';

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className={`flex flex-col lg:flex-row items-center gap-12 ${layout === 'right' ? 'lg:flex-row-reverse' : ''}`}>

                    {/* Image Side */}
                    <div className="w-full lg:w-1/2 relative">
                        {image ? (
                            <div className="relative h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                <Image
                                    src={image}
                                    alt={headline}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                        ) : (
                            <div className="h-[400px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                                No Image Selected
                            </div>
                        )}
                        {/* Decorative Element */}
                        <div className={`absolute -bottom-6 -z-10 w-64 h-64 bg-cevace-orange/10 rounded-full blur-3xl ${isLeft ? '-left-10' : '-right-10'}`} />
                    </div>

                    {/* Text Side */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cevace-blue leading-tight">
                            {headline}
                        </h2>
                        <div className="text-lg text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                            {content}
                        </div>
                        {ctaText && ctaLink && (
                            <Link
                                href={ctaLink}
                                className="inline-block bg-cevace-orange text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30"
                            >
                                {ctaText}
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
