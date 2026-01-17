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
                            {/* LinkedIn */}
                            <a
                                href="https://linkedin.com/company/cevace/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            {/* Placeholder for other social */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group">
                                <div className="w-4 h-4 bg-gray-400 group-hover:bg-white transition-colors rounded-sm" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group">
                                <div className="w-4 h-4 bg-gray-400 group-hover:bg-white transition-colors rounded-sm" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group">
                                <div className="w-4 h-4 bg-gray-400 group-hover:bg-white transition-colors rounded-sm" />
                            </a>
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
