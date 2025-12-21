'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateSlug, calculateReadingTime } from '@/utils/blog';

export type BlogPost = {
    id?: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    cover_image_url?: string;
    author_name?: string;
    reading_time?: number;
    published?: boolean;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
};

/**
 * Get all blog posts (optionally filter by published status)
 */
export async function getBlogPosts(publishedOnly = true): Promise<{ success: boolean; data?: BlogPost[]; error?: string }> {
    try {
        const supabase = createClient();

        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (publishedOnly) {
            query = query.eq('published', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching blog post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new blog post
 */
export async function createBlogPost(post: BlogPost): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const postData = {
            ...post,
            user_id: user.id,
            published_at: post.published ? new Date().toISOString() : null
        };

        const { data, error } = await supabase
            .from('blog_posts')
            .insert(postData)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath('/dashboard/blog-admin');
        return { success: true, data };
    } catch (error: any) {
        console.error('Error creating blog post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // If publishing for the first time, set published_at
        if (updates.published && !updates.published_at) {
            updates.published_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath('/dashboard/blog-admin');
        if (data?.slug) {
            revalidatePath(`/blog/${data.slug}`);
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error updating blog post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath('/dashboard/blog-admin');

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting blog post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle publish status of a blog post
 */
export async function togglePublishStatus(id: string, published: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const updates: any = { published };

        // Set published_at when publishing for the first time
        if (published) {
            updates.published_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath('/dashboard/blog-admin');

        return { success: true };
    } catch (error: any) {
        console.error('Error toggling publish status:', error);
        return { success: false, error: error.message };
    }
}
