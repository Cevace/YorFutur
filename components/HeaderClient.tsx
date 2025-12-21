'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { User, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function HeaderClient({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent hydration mismatch by only checking pathname after mount
    const safePathname = pathname || '/';
    const isHome = mounted ? safePathname === '/' : false;

    // Calculate classes - default to non-home state for SSR
    const headerClass = isHome
        ? (isScrolled ? 'bg-black/30 backdrop-blur-md py-4 shadow-sm text-white' : 'bg-transparent py-6 text-white')
        : 'bg-white py-4 shadow-sm text-gray-900';

    const linkClass = isHome
        ? 'hover:text-cevace-orange transition-colors'
        : 'hover:text-cevace-orange transition-colors text-gray-600';

    const mobileMenuBg = isHome ? 'bg-black/90' : 'bg-white';
    const mobileTextColor = isHome ? 'text-white' : 'text-gray-900';

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}
            suppressHydrationWarning
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="block">
                    <Image
                        src={isHome ? "/logo/Cevace-wit-logo.svg" : "/logo/Cevace-zwart-logo.svg"}
                        alt="Cevace"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:block">
                    <ul
                        className={`flex items-center space-x-8 font-medium ${isHome ? 'text-white' : 'text-gray-700'}`}
                        suppressHydrationWarning
                    >
                        <li><Link href="/" className={linkClass}>Home</Link></li>
                        <li><Link href="/success-stories" className={linkClass}>Success Stories</Link></li>
                        <li><Link href="/about" className={linkClass}>Over ons</Link></li>
                        <li><Link href="/blog" className={linkClass}>Blog</Link></li>
                        <li><Link href="/faq" className={linkClass}>Veelgestelde vragen</Link></li>

                        {isLoggedIn ? (
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 bg-cevace-orange px-5 py-2 rounded-full text-white hover:bg-orange-600 transition-colors"
                                >
                                    <User size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                        ) : (
                            <>

                                <li><Link href="/login" className="bg-cevace-orange px-5 py-2 rounded-full text-white hover:bg-orange-600 transition-colors">Inloggen</Link></li>
                            </>
                        )}
                    </ul>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className={`md:hidden p-2 ${isHome ? 'text-white' : 'text-gray-900'}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                    suppressHydrationWarning
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className={`md:hidden absolute top-full left-0 right-0 ${mobileMenuBg} shadow-lg p-4 flex flex-col space-y-4 ${mobileTextColor}`}>
                    <Link href="/" className="block py-2 hover:text-cevace-orange" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/success-stories" className="block py-2 hover:text-cevace-orange" onClick={() => setIsMobileMenuOpen(false)}>Success Stories</Link>
                    <Link href="/about" className="block py-2 hover:text-cevace-orange" onClick={() => setIsMobileMenuOpen(false)}>Over ons</Link>
                    <Link href="/blog" className="block py-2 hover:text-cevace-orange" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                    <Link href="/faq" className="block py-2 hover:text-cevace-orange" onClick={() => setIsMobileMenuOpen(false)}>Veelgestelde vragen</Link>


                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-cevace-orange px-5 py-2 rounded-full text-white hover:bg-orange-600 transition-colors w-fit"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <User size={18} />
                            <span>Dashboard</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="block w-fit bg-cevace-orange px-5 py-2 rounded-full text-white hover:bg-orange-600 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Inloggen
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
