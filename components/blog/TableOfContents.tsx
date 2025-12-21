'use client';

import React, { useEffect, useState } from 'react';

type TOCItem = {
    id: string;
    text: string;
    level: number;
};

type TableOfContentsProps = {
    items: TOCItem[];
};

const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px' }
        );

        items.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [items]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="rounded-lg shadow-sm border border-gray-100 px-6 pt-6 pb-5" style={{ backgroundColor: '#faf4f1' }}>
            <h3 className="font-semibold mb-3 text-sm" style={{ color: '#000000' }}>
                Inhoudsopgave
            </h3>
            <nav className="space-y-2">
                {items.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => handleClick(e, item.id)}
                        className={`block text-sm transition-colors ${activeId === item.id
                            ? 'text-cevace-orange font-medium'
                            : 'hover:text-cevace-blue'
                            }`}
                        style={{
                            paddingLeft: item.level === 3 ? '1rem' : '0',
                            color: activeId === item.id ? undefined : '#000000'
                        }}
                    >
                        {item.text}
                    </a>
                ))}
            </nav>
        </div>
    );
};

export default TableOfContents;
