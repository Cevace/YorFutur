'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Extract headings from markdown content (## and ###)
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        const matches = [...content.matchAll(headingRegex)];

        const items: TocItem[] = matches.map((match) => {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');

            return { id, text, level };
        });

        setHeadings(items);

        // Set up intersection observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -80% 0px' }
        );

        // Observe all headings
        items.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [content]);

    if (headings.length < 3) {
        // Don't show TOC if there are less than 3 headings
        return null;
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
                <List size={20} className="text-cevace-blue" />
                <h3 className="font-bold text-lg" style={{ color: '#000000' }}>
                    Inhoudsopgave
                </h3>
            </div>
            <nav>
                <ul className="space-y-2">
                    {headings.map(({ id, text, level }) => (
                        <li key={id} className={level === 3 ? 'ml-4' : ''}>
                            <a
                                href={`#${id}`}
                                className={`block text-sm transition-colors hover:text-cevace-blue ${activeId === id
                                        ? 'text-cevace-blue font-semibold'
                                        : 'text-gray-600'
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(id)?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                    });
                                }}
                            >
                                {text}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
