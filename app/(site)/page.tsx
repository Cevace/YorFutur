import { reader } from '@/lib/keystatic';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import BlogSection from '@/components/homepage/BlogSection';

export default async function Home() {
  console.log("Attempting to read 'home' page from Keystatic...");
  const page = await reader.collections.pages.read('home');
  console.log("Page data result:", page ? "Found" : "Not Found");

  // Fetch published blog posts for the blog section
  const blogSlugs = await reader.collections.blog.list();
  const allPosts = await Promise.all(
    blogSlugs.map(async (slug) => {
      const post = await reader.collections.blog.read(slug);
      return { slug, ...post };
    })
  );

  const publishedPosts = allPosts
    .filter(post => post.published)
    .sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate) : new Date(0);
      const dateB = b.publishedDate ? new Date(b.publishedDate) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center bg-gray-100 my-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to Cevace</h1>
        <p className="text-xl text-gray-700 mb-8">
          Please create a page with the slug "home" in the CMS to see content here.
        </p>
        <a
          href="/keystatic/collection/pages/create"
          className="inline-block bg-cevace-blue text-white font-bold py-3 px-8 rounded-full hover:bg-blue-800 transition-colors"
        >
          Create Home Page
        </a>
      </div>
    );
  }

  return (
    <main>
      <BlockRenderer blocks={page.content} />

      {/* Blog Section - Auto-scrolling carousel */}
      {publishedPosts.length > 0 && (
        <BlogSection
          posts={publishedPosts.map(post => ({
            slug: post.slug,
            title: post.title || 'Untitled',
            category: post.category || 'Blog',
            excerpt: post.excerpt || '',
            published_at: post.publishedDate || new Date().toISOString(),
            author_name: post.author,
            cover_image_url: post.coverImage || undefined,
            reading_time: 5,
            id: post.slug,
            content: '',
            published: true,
          }))}
        />
      )}
    </main>
  );
}
