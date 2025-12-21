'use client';

/**
 * Pricing Page Client Component
 * Uses the new pricing system with Charm Pricing display
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plan, BillingCycle } from '@/lib/pricing/types';
import { PricingTable, FeatureComparisonTable } from '@/components/pricing';
import { initiateUpgrade } from '@/actions/subscription';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SwarmBackground from '@/components/SwarmBackground';

interface PricingPageClientProps {
    plans: Plan[];
    currentPlan?: string;
}

export default function PricingPageClient({ plans, currentPlan }: PricingPageClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectPlan = async (plan: Plan, billingCycle: BillingCycle) => {
        if (plan.name === 'free') {
            router.push('/dashboard');
            return;
        }

        setIsLoading(true);
        try {
            const result = await initiateUpgrade(plan.name, billingCycle);
            if (result.success && result.checkoutUrl) {
                router.push(result.checkoutUrl);
            }
        } catch (error) {
            console.error('Error initiating upgrade:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar theme="dark" isLoggedIn={false} />
            <div className="min-h-screen bg-[#22223B] relative overflow-hidden">
                {/* Animated Background */}
                <SwarmBackground position="center" intensity="intense" />
                <div className="absolute inset-0 noise-bg opacity-30 z-[1]"></div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="pt-32 pb-16 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Investeer in je toekomst
                            </h1>
                            <p className="text-xl text-[#C9ADA7] max-w-2xl mx-auto">
                                Kies het plan dat bij jou past. Alle plannen starten met een <strong>7-daagse gratis</strong><br />Executive proefperiode.
                            </p>
                        </div>
                    </div>

                    {/* Pricing Table */}
                    <div className="pb-24 px-6">
                        <PricingTable
                            plans={plans}
                            currentPlan={currentPlan as any}
                            onSelectPlan={handleSelectPlan}
                        />
                    </div>

                    {/* Trust Badges */}
                    <div className="pb-16 px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h3 className="font-semibold text-white mb-1">Veilig betalen</h3>
                                    <p className="text-sm text-[#C9ADA7]">100% SSL beveiligd</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h3 className="font-semibold text-white mb-1">Altijd opzegbaar</h3>
                                    <p className="text-sm text-[#C9ADA7]">Geen lange contracten</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h3 className="font-semibold text-white mb-1">7 dagen gratis</h3>
                                    <p className="text-sm text-[#C9ADA7]">Probeer Executive features</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Comparison Table */}
                    <div className="pb-24 px-6">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
                                Vergelijk alle plannen
                            </h2>
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <FeatureComparisonTable />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-full p-8 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-[#d97706] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-[#22223B] font-semibold">Even geduld...</p>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
