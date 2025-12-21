import Link from 'next/link';

interface CallToActionBlockProps {
    data: {
        headline: string;
        subheadline: string;
        appleLink?: string;
        googleLink?: string;
    };
}

export default function CallToActionBlock({ data }: CallToActionBlockProps) {
    const { headline, subheadline, appleLink, googleLink } = data;
    return (
        <section className="py-24 bg-yorfutur-dark relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cevace-blue/30 to-transparent" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cevace-orange/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    {headline}
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    {subheadline}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {appleLink && (
                        <Link href={appleLink} className="bg-white text-black px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.23-.93.63 0 1.84.16 2.43.82-3.77 1.54-4.09 6.19-2.02 8.23-.26.69-.67 1.51-1.25 2.36-.61.91-1.66 1.79-2.91 1.76.01.01.01.01.01.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                            <div className="text-left">
                                <div className="text-xs font-medium text-gray-600">Download on the</div>
                                <div className="text-lg font-bold leading-none">App Store</div>
                            </div>
                        </Link>
                    )}
                    {googleLink && (
                        <Link href={googleLink} className="bg-white text-black px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91,3.34,2.39,3.84,2.15L13.69,12L3.84,21.85C3.34,21.6,3,21.09,3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08,20.75,11.5,20.75,12C20.75,12.5,20.5,12.92,20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L3.84,2.15C3.84,2.15,6.05,2.66,6.05,2.66Z" /></svg>
                            <div className="text-left">
                                <div className="text-xs font-medium text-gray-600">GET IT ON</div>
                                <div className="text-lg font-bold leading-none">Google Play</div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
