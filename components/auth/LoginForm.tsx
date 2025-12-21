'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, signup } from '@/actions/auth';
import Link from 'next/link';
import GoogleSignInButton from './GoogleSignInButton';

export default function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [plan, setPlan] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        const planParam = searchParams.get('plan');
        if (planParam) {
            setPlan(planParam);
            setActiveTab('register');
        }
    }, [searchParams]);

    async function handleLogin(formData: FormData) {
        setIsPending(true);
        setError(null);

        try {
            const res = await login(formData);

            // If there's an error, show it
            if (res?.error) {
                setError(res.error);
                setIsPending(false);
                return;
            }

            // If no error, the redirect should have happened
            // As fallback, do client-side redirect
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            // Server actions throw NEXT_REDIRECT when redirect() is called
            // This is normal behavior, not an error
            if (err?.digest?.includes('NEXT_REDIRECT')) {
                // Let the redirect happen naturally
                return;
            }

            // Only show error for actual errors
            console.error('Login error:', err);
            setError('Er is iets misgegaan bij het inloggen. Probeer het opnieuw.');
            setIsPending(false);
        }
    }

    async function handleSignup(formData: FormData) {
        setIsPending(true);
        setError(null);
        setMessage(null);
        const res = await signup(formData);
        setIsPending(false);
        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            setMessage(res.message!);
        }
    }

    return (
        <div className="flex items-center justify-center pt-32 pb-8 px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <Link href="/" className="text-3xl font-bold text-cevace-blue tracking-tight">
                        Cevace
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {activeTab === 'login' ? 'Welkom terug' : 'Maak een account aan'}
                    </h2>
                    {plan && activeTab === 'register' && (
                        <p className="mt-2 text-sm text-cevace-orange font-medium">
                            Je hebt gekozen voor het {plan === 'trial' ? '7-dagen Proef' : 'Pro'} plan!
                        </p>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-4 text-center font-medium transition-colors text-cevace-blue border-b-2 border-cevace-blue`}
                    >
                        Inloggen
                    </button>
                    {/* Public Registration Disabled during Beta
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ...`}
                    >
                        Registreren
                    </button> 
                    */}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {/* Google Sign-In Button */}
                <GoogleSignInButton />

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Of ga verder met</span>
                    </div>
                </div>

                {activeTab === 'login' ? (
                    <form action={handleLogin} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email-login" className="sr-only">Emailadres</label>
                                <input
                                    id="email-login"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-cevace-orange focus:border-cevace-orange focus:z-10 sm:text-sm"
                                    placeholder="Emailadres"
                                />
                            </div>
                            <div>
                                <label htmlFor="password-login" className="sr-only">Wachtwoord</label>
                                <input
                                    id="password-login"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-cevace-orange focus:border-cevace-orange focus:z-10 sm:text-sm"
                                    placeholder="Wachtwoord"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-cevace-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cevace-orange disabled:opacity-50 transition-colors shadow-lg hover:shadow-orange-500/30"
                            >
                                {isPending ? 'Bezig...' : 'Inloggen'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form action={handleSignup} className="mt-8 space-y-6">
                        <input type="hidden" name="plan" value={plan || 'free'} />
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="sr-only">Volledige Naam</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-cevace-orange focus:border-cevace-orange focus:z-10 sm:text-sm"
                                    placeholder="Volledige Naam"
                                />
                            </div>
                            <div>
                                <label htmlFor="email-signup" className="sr-only">Emailadres</label>
                                <input
                                    id="email-signup"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-cevace-orange focus:border-cevace-orange focus:z-10 sm:text-sm"
                                    placeholder="Emailadres"
                                />
                            </div>
                            <div>
                                <label htmlFor="password-signup" className="sr-only">Wachtwoord</label>
                                <input
                                    id="password-signup"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-cevace-orange focus:border-cevace-orange focus:z-10 sm:text-sm"
                                    placeholder="Wachtwoord"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-cevace-blue hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cevace-blue disabled:opacity-50 transition-colors shadow-lg"
                            >
                                {isPending ? 'Bezig...' : 'Account Aanmaken'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
