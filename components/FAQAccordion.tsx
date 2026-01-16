'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { FAQSection } from '@/lib/directus';

interface FAQAccordionProps {
    sections: FAQSection[];
    showLink?: boolean;
}

const FAQAccordion = ({ sections, showLink = false }: FAQAccordionProps) => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <section id="faq" className="py-24 bg-[#F2E9E4]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="h-1 w-16 bg-[#c9ada7] mb-6 rounded-full mx-auto"></div>
                    <h2 className="text-5xl font-semibold text-[#22223B] mb-4">Veelgestelde Vragen</h2>
                    <p className="text-[#4A4E69] text-lg">Alles wat je moet weten over Cevace.</p>
                </div>

                <div className="space-y-8">
                    {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <h3 className="text-lg font-semibold text-[#22223B] mb-2 uppercase tracking-wider">{section.headline}</h3>
                            <div className="w-24 h-1 bg-[#c9ada7] rounded-full mb-4" />
                            <div className="space-y-3">
                                {section.items.map((item, itemIndex) => {
                                    const itemId = `${sectionIndex}-${itemIndex}`;
                                    const isOpen = openItem === itemId;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className="bg-white border border-[#C9ADA7]/20 overflow-hidden transition-all"
                                            style={{ borderRadius: '16px' }}
                                        >
                                            <button
                                                onClick={() => toggleItem(itemId)}
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
                        </div>
                    ))}
                </div>

                {showLink && (
                    <div className="text-center mt-12">
                        <Link href="/faq" className="text-[#d97706] font-semibold hover:underline">
                            Bekijk alle vragen →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FAQAccordion;
