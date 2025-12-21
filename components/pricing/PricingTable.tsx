'use client';

/**
 * Pricing Table Component
 * Displays all pricing plans with billing toggle
 */

import { useState } from 'react';
import { Plan, BillingCycle, PlanName } from '@/lib/pricing/types';
import PricingCard from './PricingCard';
import BillingToggle from './BillingToggle';

interface PricingTableProps {
    plans: Plan[];
    currentPlan?: PlanName;
    onSelectPlan: (plan: Plan, billingCycle: BillingCycle) => void;
}

export default function PricingTable({ plans, currentPlan, onSelectPlan }: PricingTableProps) {
    // Default to quarterly to show savings immediately
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('quarterly');

    // Filter to only show paid plans (Free is handled separately)
    const paidPlans = plans.filter(plan => plan.monthlyPrice > 0);

    const handleSelect = (plan: Plan) => {
        onSelectPlan(plan, billingCycle);
    };

    return (
        <div className="w-full">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <BillingToggle value={billingCycle} onChange={setBillingCycle} />
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                {paidPlans.map((plan) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        billingCycle={billingCycle}
                        isCurrentPlan={currentPlan === plan.name}
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            {/* Free Plan Note */}
            <div className="text-center mt-12">
                <p className="text-white text-sm">
                    Niet klaar om te upgraden?{' '}
                    <button
                        onClick={() => onSelectPlan(plans.find(p => p.name === 'free')!, 'monthly')}
                        className="text-[#d97706] font-semibold hover:underline"
                    >
                        Blijf op Free
                    </button>
                </p>
            </div>
        </div>
    );
}
