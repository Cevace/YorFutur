"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="text-white py-20 border-t border-white/5" style={{ backgroundColor: '#0E172A' }}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="block">
                            <Image
                                src="/logo/Cevace-wit-logo.svg"
                                alt="Cevace"
                                width={140}
                                height={45}
                                priority
                            />
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            Jouw partner in het vinden van de perfecte baan. Wij combineren persoonlijke coaching met slimme technologie.
                        </p>
                        <div className="flex space-x-4">
                            {/* Social Icons */}
                            {['linkedin', 'instagram', 'facebook', 'twitter'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yorfutur-orange transition-colors duration-300 group">
                                    <span className="sr-only">{social}</span>
                                    <div className="w-4 h-4 bg-gray-400 group-hover:bg-white transition-colors rounded-sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Navigatie</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Home</Link></li>
                            <li><Link href="/success-stories" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Success Stories</Link></li>
                            <li><Link href="/about" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Over ons</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Juridisch</h4>
                        <ul className="space-y-4">
                            <li><Link href="/privacy" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Privacybeleid</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Algemene Voorwaarden</Link></li>
                            <li><Link href="/cookies" className="text-gray-400 hover:text-yorfutur-orange transition-colors">Cookieverklaring</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-yorfutur-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span>info@cevace.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Cevace. Alle rechten voorbehouden.</p>
                    <p>Designed with ❤️ for Your Future</p>
                </div>
            </div>
        </footer>
    );
}
