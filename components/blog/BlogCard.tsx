import Link from 'next/link';
import { BlogPost } from '@/actions/blog';
import BlogCategoryBadge from './BlogCategoryBadge';

type BlogCardProps = {
    post: BlogPost;
};

export default function BlogCard({ post }: BlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="block h-full">
            <div className="group bg-white rounded-xl border border-gray-100 p-6 h-full flex flex-col
                hover:border-cevace-orange hover:shadow-lg transition-all duration-300
                transform hover:-translate-y-1">

                {/* Category Badge */}
                <div className="mb-3">
                    <BlogCategoryBadge category={post.category} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 
                    group-hover:text-cevace-orange transition-colors duration-300
                    line-clamp-2">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                    {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-100">
                    {post.reading_time && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {post.reading_time} min. lezen
                        </span>
                    )}
                    {post.published_at && (
                        <span>
                            {new Date(post.published_at).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
