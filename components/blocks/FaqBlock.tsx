import FaqList from './FaqList';

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqBlockProps {
    data: {
        headline: string;
        items: readonly FaqItem[];
    };
}

export default function FaqBlock({ data }: FaqBlockProps) {
    const { headline, items } = data;
    return (
        <section className="py-20 bg-[#fffcf8]">
            <div className="container mx-auto px-4 max-w-4xl">
                {headline && (
                    <div className="text-left mb-8">
                        <h2 className="text-lg font-semibold text-[#22223B] uppercase tracking-wider">{headline}</h2>
                        <div className="w-24 h-1 bg-[#c9ada7] rounded-full mt-2" />
                    </div>
                )}

                <FaqList items={items} />
            </div>
        </section>
    );
}

