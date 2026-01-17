'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Heart, Sparkles } from 'lucide-react';
import type { MotivationLetterVariant } from '@/lib/motivation-letter/types';

interface VariantCardProps {
    variant: MotivationLetterVariant;
    selected: boolean;
    onSelect: () => void;
    index: number;
}

const variantConfig = {
    strategic: {
        icon: TrendingUp,
        color: '#3B82F6', // blue
        gradient: 'from-blue-500 to-blue-600',
        bgColor: '#EDEEF1', // custom gray
        borderColor: 'border-blue-500',
        textColor: 'text-blue-900',
        subtitle: 'Zakelijk & Direct',
        focus: 'ROI, Resultaat en Efficiency'
    },
    culture: {
        icon: Heart,
        color: '#A855F7', // purple
        gradient: 'from-purple-500 to-purple-600',
        bgColor: '#EDEEF1', // custom gray
        borderColor: 'border-purple-500',
        textColor: 'text-purple-900',
        subtitle: 'Warm & Authentiek',
        focus: 'Waarden, Team en Passie'
    },
    storyteller: {
        icon: Sparkles,
        color: '#F97316', // orange
        gradient: 'from-orange-500 to-orange-600',
        bgColor: '#EDEEF1', // custom gray
        borderColor: 'border-orange-500',
        textColor: 'text-orange-900',
        subtitle: 'Creatief & Memorabel',
        focus: 'Uniek Haakje en Verhaal'
    },
};

export default function VariantCard({ variant, selected, onSelect, index }: VariantCardProps) {
    const config = variantConfig[variant.variant_id];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="h-full"
        >
            <button
                onClick={onSelect}
                className={`w-full h-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group hover:scale-[1.02] ${selected
                    ? `${config.borderColor} shadow-2xl ring-4`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                    }`}
                style={selected ? { backgroundColor: config.bgColor, '--tw-ring-opacity': 0.2 } as React.CSSProperties : {}}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? `bg-gradient-to-br ${config.gradient}` : 'bg-gray-100'
                            }`}>
                            <IconComponent className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-xl ${selected ? config.textColor : 'text-gray-900'}`}>
                                {variant.title}
                            </h3>
                            <p className={`text-sm ${selected ? 'text-gray-700' : 'text-gray-500'}`}>
                                {config.subtitle}
                            </p>
                        </div>
                    </div>

                    {selected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                    )}
                </div>

                {/* Focus Badge - Centered */}
                <div className="flex justify-center mb-4">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: selected ? config.bgColor : '#F3F4F6' }}
                    >
                        <span className={selected ? config.textColor : 'text-gray-600'}>
                            Focus: {config.focus}
                        </span>
                    </div>
                </div>

                {/* Why It Works */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Waarom deze werkt:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {variant.why_it_works}
                    </p>
                </div>

                {/* Preview */}
                <div className={`p-4 rounded-lg border ${selected ? 'border-gray-300 bg-white/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Preview Opening:
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed italic line-clamp-3">
                        "{variant.preview}"
                    </p>
                </div>

                {/* Select Button */}
                <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className={`w-full py-3 rounded-full font-bold text-center transition-all ${selected
                        ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                        }`}>
                        {selected ? '✓ Gekozen' : 'Kies deze versie'}
                    </div>
                </motion.div>
            </button>
        </motion.div>
    );
}
