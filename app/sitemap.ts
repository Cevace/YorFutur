import { MetadataRoute } from 'next'

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cevace.com/cms'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cevace.com'
    const currentDate = new Date()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/waitlist`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]

    // Dynamic blog posts from Directus - fetch ALL published posts (no limit)
    let blogPosts: MetadataRoute.Sitemap = []

    try {
        const res = await fetch(
            `${DIRECTUS_URL}/items/blog_posts?filter[published][_eq]=true&sort=-published_date&fields=slug,published_date`,
            {
                next: { revalidate: 60 },
                headers: { 'Content-Type': 'application/json' },
            }
        )

        if (res.ok) {
            const json = await res.json()
            const posts = json.data || []

            blogPosts = posts.map((post: { slug: string; published_date: string | null }) => {
                const publishedDate = post.published_date
                    ? new Date(post.published_date)
                    : currentDate

                return {
                    url: `${baseUrl}/blog/${post.slug}`,
                    lastModified: publishedDate,
                    changeFrequency: 'monthly' as const,
                    priority: 0.7,
                }
            })
        }
    } catch (error) {
        console.error('Error fetching blog posts from Directus for sitemap:', error)
    }

    return [...staticPages, ...blogPosts]
}
