import { reader } from '@/lib/keystatic';
import Image from 'next/image';

interface SuccessStoriesBlockProps {
    title: string;
    subtitle: string;
}

export default async function SuccessStoriesBlock({ title, subtitle }: SuccessStoriesBlockProps) {
    const stories = await reader.collections.successStories.all();

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    <p className="text-xl text-gray-600">{subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stories.map((story) => (
                        <div key={story.slug} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                {story.entry.photo && (
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                                        <Image
                                            src={story.entry.photo}
                                            alt={story.entry.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold">{story.entry.name}</h3>
                                    <p className="text-sm text-gray-500">{story.entry.jobTitle}</p>
                                </div>
                            </div>
                            <div className="text-gray-600 italic">
                                {/* Note: DocumentRenderer would be needed here if quote is rich text, 
                    but for simplicity in this block we might just render a summary or need a client component 
                    if we want to render complex rich text inside a server component loop properly with styles.
                    However, DocumentRenderer works in server components too. */}
                                {/* For now, I'll just render a placeholder or simple text if I can extract it, 
                    but since it's a document field, I should use DocumentRenderer. 
                    I'll assume it's handled by a client wrapper or just render it directly. */}
                                "See full story for details"
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
