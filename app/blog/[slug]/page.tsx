import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import SocialShare from '@/components/blog/SocialShare';
import Breadcrumbs from '@/components/blog/Breadcrumbs';
import TableOfContents from '@/components/blog/TableOfContents';

// Helper: Capitalize only first word, but keep "CV" uppercase
function capitalizeFirstWord(str: string): string {
    const words = str.split(' ');
    return words.map((word, index) => {
        // Keep CV uppercase
        if (word.toLowerCase() === 'cv') return 'CV';
        return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
    }).join(' ');
}

// Helper: Generate slug from text for anchor IDs
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Helper: Extract headings from HTML content for TOC
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
    // Match h2 and h3 HTML tags
    const headingRegex = /<h([23])>(.*?)<\/h\1>/gi;
    const headings: { id: string; text: string; level: number }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]*>/g, '').trim(); // Strip HTML tags from heading text
        const id = slugify(text);
        headings.push({ id, text, level });
    }

    return headings;
}

export async function generateStaticParams() {
    const posts = await getPublishedBlogPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// ISR: Revalidate every 60 seconds for auto-updates from Directus
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getBlogPostBySlug(params.slug);

    if (!post) {
        return {
            title: 'Post niet gevonden',
        };
    }

    return {
        title: `${post.title} | Cevace Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.publishedDate,
            authors: [post.author],
        },
    };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getBlogPostBySlug(params.slug);

    if (!post || !post.published) {
        notFound();
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Get related posts (same category, exclude current)
    const allPosts = await getPublishedBlogPosts();
    const relatedPosts = allPosts
        .filter(p => p.category === post.category && p.slug !== post.slug)
        .slice(0, 3);

    // Extract headings for Table of Contents
    const headings = extractHeadings(post.content);

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Cevace',
            logo: {
                '@type': 'ImageObject',
                url: 'https://cevace.nl/logo.png',
            },
        },
        datePublished: post.publishedDate,
        dateModified: post.publishedDate,
        image: post.coverImage || undefined,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://cevace.nl/blog/${post.slug}`,
        },
        articleSection: post.category,
        wordCount: wordCount,
        timeRequired: `PT${readingTime}M`,
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className="min-h-screen py-12" style={{ backgroundColor: '#F2E9E4' }}>
                <div className="container mx-auto px-4 max-w-4xl" style={{ marginTop: '100px' }}>
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Blog', href: '/blog' },
                            { label: post.title },
                        ]}
                    />

                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: '#4A4E69', color: '#FFFFFF' }}>
                                {capitalizeFirstWord(post.category)}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight" style={{ color: '#000000' }}>
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-6 text-sm border-b border-gray-200 pb-6" style={{ color: '#000000' }}>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>
                                    {new Date(post.publishedDate).toLocaleDateString('nl-NL', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{readingTime} min leestijd</span>
                            </div>
                        </div>
                    </header>

                    {/* Cover Image */}
                    {post.coverImage && (
                        <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-auto"
                            />
                        </div>
                    )}

                    {/* Table of Contents */}
                    {headings.length >= 3 && (
                        <div className="mb-8">
                            <TableOfContents content={post.content} />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Social Share */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <SocialShare
                            url={`https://cevace.nl/blog/${post.slug}`}
                            title={post.title}
                        />
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-semibold mb-3" style={{ color: '#000000' }}>
                                Klaar om je carrière te boosten?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Ontdek hoe Cevace je kan helpen met je CV, sollicitaties en carrière.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-cevace-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30"
                                style={{ color: '#ffffff' }}
                            >
                                Probeer Cevace gratis
                            </Link>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-2xl font-semibold mb-6" style={{ color: '#000000' }}>
                                Gerelateerde artikelen
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost) => (
                                    <Link
                                        key={relatedPost.slug}
                                        href={`/blog/${relatedPost.slug}`}
                                        className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                                    >
                                        {relatedPost.coverImage && (
                                            <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                                <img
                                                    src={relatedPost.coverImage}
                                                    alt={relatedPost.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <h4 className="font-semibold text-sm mb-2 group-hover:text-cevace-blue transition-colors line-clamp-2" style={{ color: '#000000' }}>
                                            {relatedPost.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {relatedPost.excerpt}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Back to Blog */}
                    <div className="mt-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 hover:text-blue-900 font-medium transition-colors"
                            style={{ color: '#000000' }}
                        >
                            <ArrowLeft size={20} />
                            Meer blog posts
                        </Link>
                    </div>
                </div>
            </article>
        </>
    );
}
