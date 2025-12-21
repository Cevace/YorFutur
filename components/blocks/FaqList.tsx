'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
    question: string;
    answer: string;
}

export default function FaqList({ items }: { items: readonly FaqItem[] }) {
    const [openItem, setOpenItem] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);
    const INITIAL_COUNT = 6;

    const displayedItems = showAll ? items : items.slice(0, INITIAL_COUNT);
    const hasMore = items.length > INITIAL_COUNT;

    const toggleItem = (index: number) => {
        setOpenItem(openItem === index ? null : index);
    };

    return (
        <div>
            <div className="space-y-3">
                {displayedItems.map((item, index) => {
                    const isOpen = openItem === index;

                    return (
                        <div
                            key={index}
                            className="bg-white border border-[#C9ADA7]/20 overflow-hidden transition-all"
                            style={{ borderRadius: '16px' }}
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-[#22223B]">{item.question}</span>
                                <ChevronDown
                                    size={20}
                                    className={`text-[#d97706] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-6 pb-6 text-[#4A4E69] leading-relaxed">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More Button */}
            {hasMore && (
                <div className="mt-12 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-block bg-[#d97706] text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30"
                    >
                        {showAll ? 'Toon minder vragen' : 'Toon meer vragen'}
                    </button>
                </div>
            )}
        </div>
    );
}
