'use client';

/**
 * Pricing Card Component
 * Displays a single pricing plan with Charm Pricing display
 */

import { Plan, BillingCycle } from '@/lib/pricing/types';
import { formatPrice } from '@/lib/pricing/plans';
import { Check } from 'lucide-react';

interface PricingCardProps {
    plan: Plan;
    billingCycle: BillingCycle;
    isCurrentPlan?: boolean;
    onSelect: (plan: Plan) => void;
}

export default function PricingCard({ plan, billingCycle, isCurrentPlan, onSelect }: PricingCardProps) {
    // Calculate display price
    const displayPrice = billingCycle === 'quarterly'
        ? plan.monthlyEquivalent
        : plan.monthlyPrice;

    const originalPrice = billingCycle === 'quarterly' && plan.monthlyPrice > 0
        ? plan.monthlyPrice
        : null;

    const isFree = plan.monthlyPrice === 0;
    const isHighlighted = plan.isHighlighted;

    return (
        <div
            className={`
                relative flex flex-col h-full rounded-[20px] p-8 transition-all duration-500 group
                ${isHighlighted
                    ? 'bg-[#1a1c30] border border-[#d97706] scale-105 z-10 shadow-[0_0_60px_-15px_rgba(217,119,6,0.3)]'
                    : 'glass-premium border border-white/5 hover:border-white/20 hover:bg-white/5'
                }
            `}
        >
            {/* "Meest Gekozen" Badge */}
            {isHighlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Meest gekozen
                </div>
            )}

            {/* Plan Header */}
            <div className="mb-6 pt-4">
                <h3 className={`text-lg font-semibold mb-2 ${isHighlighted ? 'text-[#d97706]' : 'text-white'}`}>
                    {plan.headline}
                </h3>
                <p className="text-sm text-[#9A8C98]">
                    {plan.subHeadline}
                </p>
            </div>

            {/* Price Display - Charm Pricing */}
            <div className="mb-8">
                {isFree ? (
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-semibold text-white tracking-tighter">
                            Gratis
                        </span>
                    </div>
                ) : (
                    <div className="flex items-baseline gap-2">
                        {/* Show crossed-out monthly price when quarterly */}
                        {originalPrice && (
                            <span className="text-2xl line-through text-[#4A4E69]">
                                €{originalPrice}
                            </span>
                        )}
                        <span className="text-5xl font-semibold text-white tracking-tighter">
                            €{displayPrice.toFixed(displayPrice % 1 === 0 ? 0 : 2).replace('.', ',')}
                        </span>
                        <span className="text-sm text-[#9A8C98] font-medium">
                            /mnd
                        </span>
                    </div>
                )}

                {/* Billing info for quarterly */}
                {!isFree && billingCycle === 'quarterly' && (
                    <p className="text-xs mt-2 text-[#9A8C98]">
                        Gefactureerd als €{plan.quarterlyPrice} per kwartaal
                    </p>
                )}

                {/* Savings badge */}
                {!isFree && billingCycle === 'quarterly' && plan.savingsPercentage > 0 && (
                    <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-[#d97706]/20 text-[#fbbf24]">
                        Bespaar {plan.savingsPercentage}%
                    </span>
                )}
            </div>

            {/* Feature Bullets */}
            <ul className="space-y-5 mb-10 flex-1">
                {plan.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-[#C9ADA7] group-hover:text-white transition-colors">
                        <Check
                            size={16}
                            className="shrink-0 mt-0.5 text-[#C9ADA7] group-hover:text-white transition-colors"
                        />
                        <span>{bullet}</span>
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <button
                onClick={() => onSelect(plan)}
                disabled={isCurrentPlan}
                className={`
                    w-full py-4 rounded-full font-semibold text-center transition-all duration-300
                    ${isCurrentPlan
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isHighlighted
                            ? 'bg-[#d97706] text-white hover:bg-[#b45309] shadow-lg hover:shadow-orange-500/30'
                            : 'bg-[#22223B] text-white hover:bg-[#4A4E69]'
                    }
                `}
            >
                {isCurrentPlan ? 'Huidig plan' : plan.ctaText}
            </button>
        </div>
    );
}
