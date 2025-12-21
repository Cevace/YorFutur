import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export type BlogPost = {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    author: string;
    publishedDate: string;
    published: boolean;
    coverImage?: string;
    content: string;
};

export function getAllBlogPosts(): BlogPost[] {
    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
        .filter((fileName) => fileName.endsWith('.mdoc'))
        .map((fileName) => {
            const slug = fileName.replace(/\.mdoc$/, '');
            return getBlogPostBySlug(slug);
        })
        .filter((post): post is BlogPost => post !== null);

    // Sort posts by date descending
    return posts.sort((a, b) => {
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.mdoc`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title || 'Untitled',
            category: data.category || 'Sollicitatie Tips',
            excerpt: data.excerpt || '',
            author: data.author || 'YorFutur',
            publishedDate: data.publishedDate || new Date().toISOString(),
            published: data.published ?? false,
            coverImage: data.coverImage,
            content,
        };
    } catch (error) {
        console.error(`Error reading blog post: ${slug}`, error);
        return null;
    }
}

export function getPublishedBlogPosts(): BlogPost[] {
    return getAllBlogPosts().filter((post) => post.published);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
    return getPublishedBlogPosts().filter((post) => post.category === category);
}
