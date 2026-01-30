'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Rocket, Users, TrendingUp, Mail, Menu, X, Shield, Target, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function WaitlistPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage({ type: 'error', text: data.error || 'Er is iets misgegaan' });
            } else {
                setMessage({ type: 'success', text: data.message });
                setEmail('');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Er is iets misgegaan. Probeer het opnieuw.' });
        } finally {
            setIsLoading(false);
        }
    }

    const EmailSignupForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="jouw@email.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent disabled:opacity-50"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-[#d97706] text-white font-semibold rounded-full hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/30"
                >
                    {isLoading ? 'Laden...' : 'Aanmelden'}
                </button>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </form>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#22223B] to-[#f2e9e4] flex flex-col">
            {/* Navigation */}
            <nav className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo/Cevace-wit-logo.svg"
                            alt="Cevace"
                            width={140}
                            height={36}
                            className="h-9 w-auto"
                        />
                    </Link>

                    {/* Desktop login link */}
                    <Link
                        href="/login"
                        className="hidden md:block text-sm font-medium text-white hover:text-[#d97706] transition-colors"
                    >
                        Al lid? Inloggen →
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-white hover:text-[#d97706] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile menu dropdown - compact with stable classes */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-slate-900 bg-opacity-80 backdrop-blur-lg border-t border-white/10">
                        <div className="px-6 py-3">
                            <Link
                                href="/login"
                                className="block py-2 text-white hover:text-orange-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Al lid? Inloggen →
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 px-4 py-16">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d97706]/10 border border-[#d97706]/30">
                        <Sparkles className="w-4 h-4 text-[#d97706]" />
                        <span className="text-sm font-semibold text-[#d97706] uppercase tracking-wider">
                            Lancering Februari 2026
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                        Solliciteren met{' '}
                        <span className="text-gradient-gold">richting</span>, niet op gevoel.
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl text-[#9A8C98] max-w-3xl mx-auto leading-relaxed">
                        Cevace helpt je om je CV, LinkedIn en sollicitaties op elkaar af te stemmen – zodat je duidelijker overkomt en betere keuzes maakt in je volgende carrièrestap.
                    </p>
                </div>

                {/* Section 1: Waarom solliciteren vaak onnodig ingewikkeld voelt */}
                <div className="max-w-4xl mx-auto mb-24">
                    <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                            Waarom solliciteren vaak onnodig ingewikkeld voelt
                        </h2>

                        <div className="space-y-6 text-[#C9ADA7]">
                            <p className="text-lg md:text-xl font-semibold text-white">
                                Veel professionals doen inhoudelijk alles goed, maar lopen vast op het proces.
                                Twijfel over het CV. Onzekerheid over de juiste rol. Geen idee waarom reacties uitblijven.
                            </p>

                            <p className="text-lg leading-relaxed">
                                Niet omdat ze niet goed genoeg zijn, maar omdat:
                            </p>

                            <ul className="space-y-3 pl-6">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#d97706] mt-1">•</span>
                                    <span>hun verhaal niet scherp genoeg is</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#d97706] mt-1">•</span>
                                    <span>hun profiel niet aansluit op hoe er wordt geselecteerd</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#d97706] mt-1">•</span>
                                    <span>ze te veel moeten gokken in plaats van gericht kiezen</span>
                                </li>
                            </ul>

                            <p className="text-lg md:text-xl font-semibold text-white pt-4">
                                Cevace is er om daar rust en overzicht in te brengen.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <EmailSignupForm />
                        </div>
                    </div>
                </div>

                {/* Section 2: Waarom je je nu al kunt aanmelden */}
                <div className="max-w-4xl mx-auto mb-24">
                    <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                            Waarom je je nu al kunt aanmelden
                        </h2>

                        <div className="space-y-6">
                            <p className="text-lg text-[#C9ADA7] text-center">
                                Cevace wordt stap voor stap gelanceerd.<br />
                                De waitlist geeft je toegang vóór de publieke release.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mb-4">
                                        <Rocket className="w-6 h-6 text-[#d97706]" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">Vroege toegang tot het platform</h3>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mb-4">
                                        <TrendingUp className="w-6 h-6 text-[#d97706]" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">Voorrang bij nieuwe functies</h3>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6 text-[#d97706]" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">Exclusieve launch-voorwaarden voor early users</h3>
                                </div>
                            </div>

                            <p className="text-center text-[#C9ADA7] pt-4">
                                De eerste toegang is bewust beperkt gehouden.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <EmailSignupForm />
                        </div>
                    </div>
                </div>

                {/* Section 3: Ontwikkeld met oog voor vertrouwen */}
                <div className="max-w-4xl mx-auto mb-24">
                    <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                            Ontwikkeld met oog voor vertrouwen
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mx-auto">
                                    <Target className="w-6 h-6 text-[#d97706]" />
                                </div>
                                <p className="text-white text-center font-medium">
                                    Gebouwd op inzichten uit recruitment en selectie
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-6 h-6 text-[#d97706]" />
                                </div>
                                <p className="text-white text-center font-medium">
                                    Gericht op de Europese arbeidsmarkt
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mx-auto">
                                    <Shield className="w-6 h-6 text-[#d97706]" />
                                </div>
                                <p className="text-white text-center font-medium">
                                    Privacy-first en volledig EU-gehost
                                </p>
                            </div>
                        </div>

                        <p className="text-center text-[#C9ADA7] pt-4">
                            Jij houdt altijd de regie over je gegevens en keuzes.
                        </p>

                        <div className="pt-8 border-t border-white/10">
                            <EmailSignupForm />
                        </div>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-[#22223B] bg-slate-800 overflow-hidden"
                                >
                                    <img
                                        src={`https://i.pravatar.cc/150?img=${i + 20}`}
                                        alt="Member"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400">
                            <span className="text-white font-semibold">200+</span> mensen zijn je al voorgegaan
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
