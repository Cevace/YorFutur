import Image from 'next/image';

interface LogoGridBlockProps {
    headline: string;
    logos: readonly string[];
}

export default function LogoGridBlock({ headline, logos }: LogoGridBlockProps) {
    return (
        <section className="py-16 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <h3 className="text-center text-gray-500 font-medium mb-10 uppercase tracking-widest text-sm">
                    {headline}
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70">
                    {logos.map((logo, index) => (
                        <div key={index} className="relative w-32 h-16 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer">
                            <Image
                                src={logo}
                                alt={`Partner logo ${index + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
