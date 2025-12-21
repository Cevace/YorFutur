import Link from 'next/link';

interface Package {
    name: string;
    price: string;
    priceSuffix?: string;
    description?: string;
    features: readonly string[];
    highlight?: boolean;
}

interface PricingBlockProps {
    data: {
        headline: string;
        packages: readonly Package[];
    };
}

export default function PricingBlock({ data }: PricingBlockProps) {
    const { headline, packages } = data;
    return (
        <section className="pt-32 pb-8 bg-gray-50">
            <div className="container mx-auto">
                <div className="text-left mb-16 px-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-cevace-blue mb-4">{headline}</h2>
                    <div className="w-24 h-1 bg-[#c9ada7] rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {packages.map((pkg, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-3 flex flex-col ${pkg.highlight
                                ? 'bg-cevace-blue text-white shadow-2xl scale-105 z-10 ring-4 ring-cevace-orange/50'
                                : 'bg-white text-gray-900 shadow-lg'
                                }`}
                        >
                            {pkg.highlight && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cevace-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tight shadow-md whitespace-nowrap">
                                    Meest Gekozen
                                </div>
                            )}

                            <h3 className={`text-xl font-bold mb-3 ${pkg.highlight ? 'text-cevace-orange' : 'text-cevace-blue'}`}>
                                {pkg.name}
                            </h3>

                            {/* Description */}
                            {pkg.description && (
                                <p className={`text-sm mb-6 leading-relaxed ${pkg.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {pkg.description}
                                </p>
                            )}

                            {/* Price with suffix */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-semibold">
                                        {pkg.price}
                                    </span>
                                    {pkg.priceSuffix && (
                                        <span className={`text-sm ${pkg.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {pkg.priceSuffix}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link
                                href={`/login?plan=${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 mb-8 text-center ${pkg.highlight
                                    ? 'bg-cevace-orange text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30'
                                    : 'bg-gray-100 text-cevace-blue hover:bg-gray-200'
                                    }`}
                            >
                                Kies Pakket
                            </Link>

                            {/* Features List */}
                            <ul className="space-y-4 flex-grow">
                                {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                        <svg className={`w-6 h-6 flex-shrink-0 ${pkg.highlight ? 'text-cevace-orange' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className={pkg.highlight ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
