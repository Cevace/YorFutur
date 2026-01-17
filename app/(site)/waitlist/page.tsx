'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, CheckCircle2, Rocket, Users, TrendingUp, Mail } from 'lucide-react';

export default function WaitlistPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#1a1c30] to-[#22223B] flex flex-col">
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
                    <Link
                        href="/login"
                        className="text-sm font-medium text-white hover:text-[#d97706] transition-colors"
                    >
                        Al lid? Inloggen →
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-2xl w-full text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d97706]/10 border border-[#d97706]/30">
                        <Sparkles className="w-4 h-4 text-[#d97706]" />
                        <span className="text-sm font-semibold text-[#d97706] uppercase tracking-wider">
                            Lancering Februari 2026
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                            De toekomst van{' '}
                            <span className="text-gradient-gold">carrière coaching</span>
                        </h1>
                        <p className="text-xl text-[#9A8C98] max-w-xl mx-auto">
                            Wees er bij vanaf dag één. Schrijf je in voor early access en krijg exclusieve voordelen.
                        </p>
                    </div>

                    {/* Signup Form */}
                    <div className="max-w-md mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent disabled:opacity-50"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-4 bg-[#d97706] text-white font-semibold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/30"
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

                        <p className="text-sm text-gray-400 mt-4">
                            Geen spam. We sturen je alleen een bericht bij de lancering.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#d97706]/30 transition-all">
                            <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mb-4 mx-auto">
                                <Rocket className="w-6 h-6 text-[#d97706]" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Early Access</h3>
                            <p className="text-sm text-gray-400">
                                Krijg als eerste toegang tot alle features
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#d97706]/30 transition-all">
                            <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mb-4 mx-auto">
                                <TrendingUp className="w-6 h-6 text-[#d97706]" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Speciale Korting</h3>
                            <p className="text-sm text-gray-400">
                                30% korting op je eerste 3 maanden
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#d97706]/30 transition-all">
                            <div className="w-12 h-12 rounded-full bg-[#d97706]/20 flex items-center justify-center mb-4 mx-auto">
                                <Users className="w-6 h-6 text-[#d97706]" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">VIP Community</h3>
                            <p className="text-sm text-gray-400">
                                Word lid van onze exclusive community
                            </p>
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div className="pt-8 border-t border-white/10">
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
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
                    <p>&copy; 2026 Cevace. Alle rechten voorbehouden.</p>
                </div>
            </footer>
        </div>
    );
}
