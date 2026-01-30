'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AccordionTool } from '@/lib/directus';

// Helper to combine classes without clsx
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface HorizontalAccordionProps {
    items: AccordionTool[];
}

export default function HorizontalAccordion({ items }: HorizontalAccordionProps) {
    // STATE MANAGEMENT CRITIQUE:
    // 1. Initializing state with props (items[0]?.id) is dangerous if items are empty initially (SSR mismatch).
    // 2. We need to handle the case where `items` changes (Directus fetch resolves).
    // 3. IDs might be strings from one source and numbers from another. We force string comparison.

    const [activeId, setActiveId] = useState<string | number | null>(null);

    // Sync state with props: Always default to the first item if no activeId is set, or if the current activeId is no longer valid.
    React.useEffect(() => {
        if (!items || items.length === 0) return;

        // If no active ID, or the current active ID is not in the new list, reset to first.
        const currentIdExists = items.some(item => String(item.id) === String(activeId));

        if (!activeId || !currentIdExists) {
            setActiveId(items[0].id);
        }
    }, [items, activeId]);

    // Safety check: If no items, render nothing (or a skeleton if users prefer, but "invisible" is worse than "gone").
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-[#F2E9E4] overflow-hidden" id="tools-accordion">
            {/* 
               LAYOUT CRITIQUE:
               1. h-[600px] is rigid. On mobile, this might be too tall or too short. 
               2. Flexbox children need `min-w-0` to allow shrinking properly in a flex container.
            */}
            <div className="max-w-7xl mx-auto px-6 h-[600px] flex flex-col md:flex-row gap-4">
                {items.map((item) => {
                    // Type Safety: Convert both to string for robust comparison.
                    // Handles "1" vs 1 equality issues mercilessly.
                    const isActive = String(activeId) === String(item.id);

                    return (
                        <div
                            key={item.id}
                            onClick={() => setActiveId(item.id)}
                            className={cn(
                                "relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-700 ease-in-out border border-[#C9ADA7]/20",
                                // LAYOUT FIX: `min-w-0` prevents flex item from refusing to shrink.
                                // `flex-grow` logic: Active takes 5x space, inactive takes 1x.
                                isActive ? "grow-[5] min-w-0 opacity-100" : "grow min-w-0 opacity-80 hover:opacity-100 bg-white"
                            )}
                        >
                            {/* Background Image (Active Only) */}
                            <div
                                className={cn(
                                    "absolute inset-0 bg-cover bg-center transition-opacity duration-700 bg-slate-800",
                                    isActive ? "opacity-100" : "opacity-0"
                                )}
                                style={{
                                    backgroundImage: item.background_image ? `url(${item.background_image})` : undefined
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            </div>

                            {/* Inactive Content - Vertical Text */}
                            <div
                                className={cn(
                                    "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
                                    isActive ? "opacity-0 pointer-events-none" : "opacity-100 delay-200"
                                )}
                            >
                                <div className="flex flex-col items-center gap-4 p-4 h-full justify-center">
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-full bg-[#F97316]/10 flex items-center justify-center text-[#F97316] shrink-0">
                                        <i className={cn(item.icon_class || "fa-solid fa-star")}></i>
                                    </div>

                                    {/* Vertical Text using standard CSS */}
                                    <h3
                                        className="text-[#22223B] font-bold text-xl uppercase tracking-widest text-center whitespace-nowrap"
                                        style={{
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                            transform: 'rotate(180deg)'
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Active Content */}
                            <div
                                className={cn(
                                    "absolute inset-0 p-8 md:p-12 flex flex-col justify-end transition-all duration-700 delay-100",
                                    isActive ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                                )}
                            >
                                <div className="space-y-4 max-w-2xl transform transition-all duration-700">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316] text-white text-xs font-bold uppercase tracking-wider w-fit">
                                        {item.subtitle || 'Tool'}
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                        {item.title}
                                    </h2>

                                    <p className="text-gray-200 text-lg md:text-xl max-w-lg line-clamp-3 md:line-clamp-none">
                                        {item.description}
                                    </p>

                                    {item.button_text && (
                                        <a
                                            href={item.button_url || '#'}
                                            className="inline-flex items-center gap-2 mt-6 px-8 py-4 bg-[#F97316] hover:bg-orange-600 text-white rounded-full font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transform hover:-translate-y-1 w-fit"
                                        >
                                            {item.button_text} <ArrowRight size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
