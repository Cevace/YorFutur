'use client';

import { useState } from 'react';
import type { MotivationLetterVariant } from '@/lib/motivation-letter/types';

interface VariantSelectorProps {
    variants: MotivationLetterVariant[];
    selected: 'strategic' | 'culture' | 'storyteller';
    onSelect: (variant: 'strategic' | 'culture' | 'storyteller') => void;
    tone?: 'formal' | 'informal';
}

const variantConfig = {
    strategic: {
        emoji: '📊',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-900',
    },
    culture: {
        emoji: '💙',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-900',
    },
    storyteller: {
        emoji: '📖',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-900',
    },
};

export default function VariantSelector({ variants, selected, onSelect, tone }: VariantSelectorProps) {
    return (
        <div className="space-y-4">
            {/* Tone Indicator */}
            {tone && (
                <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    <span className="font-semibold">Gedetecteerde toon:</span>{' '}
                    <span className={tone === 'formal' ? 'text-blue-600' : 'text-green-600'}>
                        {tone === 'formal' ? 'Formeel (u/uw)' : 'Informeel (je/jouw)'}
                    </span>
                </div>
            )}

            {/* Variant Cards */}
            <div className="space-y-3">
                {variants.map((variant) => {
                    const config = variantConfig[variant.variant_id];
                    const isSelected = selected === variant.variant_id;

                    return (
                        <button
                            key={variant.variant_id}
                            onClick={() => onSelect(variant.variant_id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? `${config.borderColor} ${config.bgColor} shadow-md`
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`text-3xl flex-shrink-0 ${isSelected ? '' : 'opacity-50'
                                        }`}
                                >
                                    {config.emoji}
                                </div>
                                <div className="flex-1">
                                    <h3
                                        className={`font-bold mb-1 ${isSelected ? config.textColor : 'text-gray-900'
                                            }`}
                                    >
                                        {variant.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {variant.subject_line}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Preview Text */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">💡 Kies een stijl:</p>
                <ul className="space-y-1">
                    <li>• <strong>De Strateeg:</strong> Perfect voor corporate/zakelijke functies</li>
                    <li>• <strong>De Cultuurmatch:</strong> Ideaal voor missie-gedreven organisatie</li>
                    <li>• <strong>De Verhalenverteller:</strong> Memorabel voor creatieve functies</li>
                </ul>
            </div>
        </div>
    );
}
