'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { User, Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { name: 'Home', href: '/' },
    { name: 'Success Stories', href: '/success-stories' },
    { name: 'Over ons', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Prijzen', href: '/pricing' },
    { name: 'Veelgestelde vragen', href: '/faq' }
];

interface NavbarProps {
    theme?: 'dark' | 'light';
    isLoggedIn?: boolean;
}

export default function Navbar({ theme = 'light', isLoggedIn = false }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isDark = theme === 'dark';

    // Header styling based on theme and scroll state
    const headerClass = isDark
        ? (isScrolled || isMobileMenuOpen ? 'bg-[#22223B]/95 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5')
        : (isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm' : 'bg-white py-4 shadow-sm');

    // Text colors
    const textColor = isDark ? 'text-[#C9ADA7]' : 'text-gray-600';
    const hoverColor = isDark ? 'hover:text-white' : 'hover:text-[#d97706]';
    const logoSrc = isDark ? '/logo/Cevace-wit-logo.svg' : '/logo/Cevace-zwart-logo.svg';

    // Mobile menu styling
    const mobileMenuBg = isDark ? 'bg-[#22223B]' : 'bg-white';
    const mobileTextColor = isDark ? 'text-white' : 'text-gray-900';

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="block">
                    <Image
                        src={logoSrc}
                        alt="Cevace"
                        width={132}
                        height={35}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Navigation - Right aligned */}
                <nav className="hidden md:flex items-center gap-8">
                    <ul className={`flex items-center gap-8 text-base font-medium ${textColor}`}>
                        {NAV_LINKS.map(link => (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className={`${hoverColor} transition-colors py-2`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Buttons */}
                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-[#d97706] px-5 py-2 rounded-full text-white font-medium text-base hover:bg-orange-600 transition-colors"
                        >
                            <User size={18} />
                            <span>Dashboard</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className={`text-base font-medium ${textColor} ${hoverColor} transition-colors`}
                            >
                                Inloggen
                            </Link>
                            <Link
                                href="/login"
                                className="bg-[#d97706] px-5 py-2 rounded-full text-white font-medium text-base hover:bg-orange-600 transition-colors"
                            >
                                Aanmelden
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className={`md:hidden p-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Navigation Overlay - Compact Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 bg-opacity-90 backdrop-blur-md shadow-lg p-6 flex flex-col space-y-4 text-white z-[60]">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium hover:text-orange-600 transition-colors py-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="h-px w-full bg-white/20 my-2"></div>

                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-full font-semibold text-base w-fit"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <User size={18} />
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="bg-orange-600 text-white px-6 py-2 rounded-full font-semibold text-base text-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Aanmelden
                            </Link>
                            <Link
                                href="/login"
                                className="font-medium text-white/70 hover:text-white transition-colors text-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Inloggen
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
