import { notFound } from 'next/navigation';
import { getPage } from '@/lib/directus';

export default async function Page(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const page = await getPage(slug);

    if (!page) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
            <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </main>
    );
}