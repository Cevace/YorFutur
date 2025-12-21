import { reader } from '@/lib/keystatic';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const pages = await reader.collections.pages.all();
    return pages.map((page) => ({
        slug: page.slug,
    }));
}

// DE FIX: Let op 'Promise' in de regel hieronder
export default async function Page(props: { params: Promise<{ slug: string }> }) {
    // 1. We wachten netjes op de parameters
    const params = await props.params;

    // 2. Nu halen we de slug eruit
    const { slug } = params;

    // 3. En zoeken we de pagina in het CMS
    const page = await reader.collections.pages.read(slug);

    if (!page) {
        notFound();
    }

    return (
        <main>
            {/* Hier tonen we de blokken uit het CMS */}
            <BlockRenderer blocks={page.content} />
        </main>
    );
}