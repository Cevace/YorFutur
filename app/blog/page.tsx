import { getPublishedBlogPosts } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';

// ISR: Revalidate every 60 seconds for auto-updates from Directus
export const revalidate = 60;

export default async function BlogPage() {
    const posts = await getPublishedBlogPosts();

    return (
        <div className="min-h-screen py-12" style={{ backgroundColor: '#F2E9E4' }}>
            <div className="container mx-auto px-4 max-w-6xl" style={{ marginTop: '100px' }}>
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4" style={{ color: '#000000' }}>
                        Blog
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#000000' }}>
                        Praktische tips en inzichten voor je carrière en sollicitatie
                    </p>
                </div>

                <BlogList posts={posts} />
            </div>
        </div>
    );
}
