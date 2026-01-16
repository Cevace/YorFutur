import { getAllBlogPosts, getPublishedBlogPosts } from '@/lib/blog';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

// Helper: Capitalize only first word
function capitalizeFirstWord(str: string): string {
    const words = str.split(' ');
    return words.map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
    ).join(' ');
}

// ISR: Revalidate every 60 seconds for auto-updates from Keystatic
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

                {/* Blog Posts Grid */}
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg" style={{ color: '#000000' }}>Nog geen blog posts gepubliceerd.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                {/* Cover Image */}
                                {post.coverImage && (
                                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-orange-100 overflow-hidden">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    {/* Category Badge - Without Icon */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#e7e8ea', color: '#000000' }}>
                                            {capitalizeFirstWord(post.category)}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="font-bold mb-3 group-hover:text-cevace-blue transition-colors line-clamp-2" style={{ fontSize: '20px', lineHeight: '1.4', color: '#000000' }}>
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-sm mb-4 line-clamp-3" style={{ color: '#000000' }}>
                                        {post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs" style={{ color: '#000000' }}>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            <span>
                                                {new Date(post.publishedDate).toLocaleDateString('nl-NL', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User size={12} />
                                            <span>{post.author}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
