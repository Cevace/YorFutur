'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function BetaLoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

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

            // Success - redirect handled by server action
            // But force a router refresh and navigation
            router.refresh();
            router.push('/dashboard');
        } catch (err: any) {
            // Check for redirect error (which is actually success in Server Actions)
            if (err?.digest?.includes('NEXT_REDIRECT')) {
                // Success! The redirect will happen automatically
                router.refresh();
                router.push('/dashboard');
                return;
            }

            console.error('Login error:', err);
            setError('Er is iets misgegaan bij het inloggen. Controleer je gegevens.');
            setIsPending(false);
        }
    }

    return (
        <div className="flex items-center justify-center pt-32 pb-8 px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/logo/Cevace-zwart-logo.svg"
                            alt="Cevace"
                            width={160}
                            height={45}
                            priority
                            className="mx-auto"
                        />
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Beta Toegang
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Log in met je ontvangen accountgegevens.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

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
            </div>
        </div>
    );
}
