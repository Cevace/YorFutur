import { DocumentRenderer } from '@keystatic/core/renderer';

interface TextBlockProps {
    data: {
        content: any; // Keystatic document content
    };
}

export default async function TextBlock({ data }: TextBlockProps) {
    const { content } = data;
    const document = typeof content === 'function' ? await content() : content;

    if (!document) {
        return null;
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 prose prose-lg max-w-4xl text-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black">
                <DocumentRenderer document={document} />
            </div>
        </section>
    );
}
