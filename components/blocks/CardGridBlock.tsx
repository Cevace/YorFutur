import Image from 'next/image';
import Link from 'next/link';

interface Card {
    title: string;
    description: string;
    image?: string | null;
    link?: string;
    linkLabel?: string;
}

interface CardGridBlockProps {
    data: {
        headline: string;
        cards: readonly Card[];
    };
}

export default function CardGridBlock({ data }: CardGridBlockProps) {
    const { headline, cards } = data;
    return (
        <section className="py-20 bg-yorfutur-light">
            <div className="container mx-auto px-4">
                <div className="text-left mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-cevace-blue mb-4">{headline}</h2>
                    <div className="w-24 h-1 bg-[#c9ada7] rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="group relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            {/* Full Background Image */}
                            {card.image ? (
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-800" />
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

                            {/* Card Content Overlay */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cevace-orange transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-gray-200 mb-6 leading-relaxed">
                                    {card.description}
                                </p>
                                {card.link && (
                                    <Link
                                        href={card.link}
                                        className="inline-flex items-center font-bold text-cevace-orange hover:text-orange-400 transition-colors"
                                    >
                                        {card.linkLabel || 'Lees meer'}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
