'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AccordionTool } from '@/lib/directus';

// Helper to combine classes without clsx
// Helper to combine classes without clsx
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

// Helper for pure sentence case (first letter upper, rest lower)
function toSentenceCase(str: string) {
    if (!str) return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

interface HorizontalAccordionProps {
    items: AccordionTool[];
}

export default function HorizontalAccordion({ items }: HorizontalAccordionProps) {
    const [activeId, setActiveId] = useState<string | number | null>(null);

    // Sync state with props
    React.useEffect(() => {
        if (!items || items.length === 0) return;
        const currentIdExists = items.some(item => String(item.id) === String(activeId));
        if (!activeId || !currentIdExists) {
            setActiveId(items[0].id);
        }
    }, [items, activeId]);

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-[#F2E9E4] overflow-hidden" id="tools-accordion">
            <div className="max-w-7xl mx-auto px-6 h-[450px] flex flex-col md:flex-row gap-4">
                {items.map((item) => {
                    const isActive = String(activeId) === String(item.id);

                    // Title formatting for inactive state: Sentence case -> split by words
                    const titleSentence = toSentenceCase(item.title);
                    const titleWords = titleSentence.split(' ');

                    return (
                        <div
                            key={item.id}
                            onClick={() => setActiveId(item.id)}
                            className={cn(
                                "relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-700 ease-in-out border border-[#C9ADA7]/20",
                                "shadow-sm hover:shadow-2xl",
                                // LAYOUT TWEAK: Reduce grow from 5 to 3 to make inactive items relatively wider (20% logic)
                                isActive ? "grow-[3] min-w-0 opacity-100" : "grow min-w-0 opacity-80 hover:opacity-100 bg-white"
                            )}
                        >
                            {/* Background Image (Always Visible now) */}
                            <div
                                className={cn(
                                    "absolute inset-0 bg-cover bg-center transition-opacity duration-700 bg-slate-800",
                                    // User Request: Show images even when closed
                                    "opacity-100"
                                )}
                                style={{
                                    backgroundImage: item.background_image ? `url(${item.background_image})` : undefined
                                }}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-t transition-all duration-700",
                                    // Darker overlay for inactive to ensure text pop, standard for active
                                    isActive ? "from-black/90 via-black/40 to-transparent" : "from-black/80 via-black/20 to-transparent"
                                )}></div>
                            </div>

                            {/* Inactive Content - Stacked Words, Bottom Left Aligned */}
                            <div
                                className={cn(
                                    "absolute inset-0 flex transition-opacity duration-500",
                                    // Align bottom (justify-end) and left (items-start) to match active button
                                    "flex-col justify-end items-start p-8 md:p-12",
                                    isActive ? "opacity-0 pointer-events-none" : "opacity-100 delay-200"
                                )}
                            >
                                <div className="flex flex-col items-start gap-1">
                                    {/* Words stacked vertically */}
                                    {titleWords.map((word, i) => (
                                        <span key={i} className="text-white font-bold text-lg leading-tight drop-shadow-md">
                                            {word}
                                        </span>
                                    ))}
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
                                            className="inline-flex items-center gap-2 mt-6 px-8 py-4 bg-[#F97316] hover:bg-orange-600 text-white rounded-full font-bold transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transform hover:-translate-y-1 w-fit text-[16px]"
                                        >
                                            {/* Button text: Sentence case */}
                                            {toSentenceCase(item.button_text)} <ArrowRight size={18} />
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
