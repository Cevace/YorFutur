import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    // Generate JSON-LD for breadcrumbs
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href ? `https://cevace.nl${item.href}` : undefined,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm" style={{ color: '#000000' }}>
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                            {index > 0 && (
                                <ChevronRight size={14} style={{ color: '#000000' }} />
                            )}
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-cevace-blue transition-colors flex items-center gap-1"
                                    style={{ color: '#000000' }}
                                >
                                    {index === 0 && <Home size={14} />}
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="font-medium truncate max-w-[200px]" style={{ color: '#000000' }}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
