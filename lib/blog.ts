import { getBlogPosts, getBlogPost } from './directus';

export type BlogPost = {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    author: string;
    publishedDate: string;
    published: boolean;
    coverImage?: string | null;
    content: string;
};

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    const posts = await getBlogPosts();
    return posts.map(post => ({
        ...post,
        author: post.author || 'Cevace',
        publishedDate: post.publishedDate || new Date().toISOString(),
        published: post.published ?? true,
        content: post.content || '',
        coverImage: post.coverImage || undefined,
    }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const post = await getBlogPost(slug);
    if (!post) return null;

    return {
        ...post,
        author: post.author || 'Cevace',
        publishedDate: post.publishedDate || new Date().toISOString(),
        published: post.published ?? true,
        content: post.content || '',
        coverImage: post.coverImage || undefined,
    };
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
    const allPosts = await getAllBlogPosts();
    return allPosts.filter((post) => post.published);
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    const publishedPosts = await getPublishedBlogPosts();
    return publishedPosts.filter((post) => post.category === category);
}

