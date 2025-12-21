'use client';

/**
 * Billing Toggle Component
 * Switches between Monthly and Quarterly billing
 * Default: Quarterly (to show savings immediately)
 */

import { BillingCycle } from '@/lib/pricing/types';

interface BillingToggleProps {
    value: BillingCycle;
    onChange: (cycle: BillingCycle) => void;
}

export default function BillingToggle({ value, onChange }: BillingToggleProps) {
    const isQuarterly = value === 'quarterly';

    return (
        <div className="inline-flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
            <button
                onClick={() => onChange('monthly')}
                className={`
                    px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                    ${!isQuarterly
                        ? 'bg-[#22223B] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                `}
            >
                Maandelijks
            </button>
            <button
                onClick={() => onChange('quarterly')}
                className={`
                    px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2
                    ${isQuarterly
                        ? 'bg-[#d97706] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                `}
            >
                Kwartaal
                {isQuarterly && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        -20%
                    </span>
                )}
            </button>
        </div>
    );
}
