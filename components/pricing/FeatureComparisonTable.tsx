'use client';

/**
 * Feature Comparison Table Component
 * Shows all Cevace services with checkmarks per plan
 */

import { Check, X } from 'lucide-react';

interface FeatureRow {
    name: string;
    free: boolean | string;
    essential: boolean | string;
    professional: boolean | string;
    executive: boolean | string;
}

const FEATURES: FeatureRow[] = [
    // CV Features
    { name: 'CV templates', free: '1', essential: 'Alle standaard', professional: 'Alle standaard', executive: 'Alle premium' },
    { name: 'PDF download', free: false, essential: true, professional: true, executive: true },
    { name: 'Live CV link', free: false, essential: true, professional: true, executive: true },
    { name: 'Live CV link statistieken', free: false, essential: false, professional: false, executive: true },

    // Brief Features
    { name: 'Motivatiebrief generator', free: '1 concept', essential: 'Onbeperkt', professional: 'Onbeperkt', executive: 'Onbeperkt' },

    // CV Tuner
    { name: 'CV Tuner - Score', free: true, essential: true, professional: true, executive: true },
    { name: 'CV Tuner - Tips', free: false, essential: true, professional: true, executive: true },
    { name: 'CV Tuner - Auto optimalisatie', free: false, essential: false, professional: true, executive: true },

    // LinkedIn
    { name: 'LinkedIn Optimizer', free: false, essential: false, professional: true, executive: true },

    // Job Features
    { name: 'Sollicitatie Tracker', free: false, essential: true, professional: true, executive: true },
    { name: 'Job Radar', free: 'Beperkt', essential: 'Volledig', professional: 'Prioriteit', executive: 'Prioriteit' },
    { name: 'Salarischeck', free: false, essential: false, professional: true, executive: true },

    // Assessment & Interview
    { name: 'Assessment Training', free: false, essential: false, professional: false, executive: true },
    { name: 'Interview Coach (AI)', free: false, essential: false, professional: 'Basis', executive: 'Geavanceerd' },
];

const PLAN_NAMES = ['Free', 'Essential', 'Professional', 'Executive'];

function FeatureCell({ value }: { value: boolean | string }) {
    if (typeof value === 'string') {
        return <span className="text-sm text-[#C9ADA7]">{value}</span>;
    }

    if (value) {
        return <Check size={20} className="text-green-400 mx-auto" />;
    }

    return <X size={20} className="text-[#4A4E69] mx-auto" />;
}

export default function FeatureComparisonTable() {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full max-w-6xl mx-auto border-collapse">
                {/* Header */}
                <thead>
                    <tr>
                        <th className="text-left p-4 text-white font-semibold border-b border-white/10">
                            Diensten
                        </th>
                        {PLAN_NAMES.map((plan) => (
                            <th
                                key={plan}
                                className={`p-4 text-center font-semibold border-b border-white/10 ${plan === 'Professional' ? 'text-[#d97706]' : 'text-white'
                                    }`}
                            >
                                {plan}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody>
                    {FEATURES.map((feature, index) => (
                        <tr
                            key={feature.name}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                            <td className="p-4 text-sm text-white">
                                {feature.name}
                            </td>
                            <td className="p-4 text-center">
                                <FeatureCell value={feature.free} />
                            </td>
                            <td className="p-4 text-center">
                                <FeatureCell value={feature.essential} />
                            </td>
                            <td className="p-4 text-center bg-white/5">
                                <FeatureCell value={feature.professional} />
                            </td>
                            <td className="p-4 text-center">
                                <FeatureCell value={feature.executive} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
