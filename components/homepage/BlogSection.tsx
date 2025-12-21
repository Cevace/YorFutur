'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/actions/blog';

type BlogSectionProps = {
    posts: BlogPost[];
};

const categoryTabs = [
    { label: 'Alles', value: 'all' },
    { label: 'Sollicitatie Tips', value: 'Sollicitatie Tips' },
    { label: 'CV Schrijven', value: 'CV Schrijven' },
    { label: 'Carrière', value: 'Carrière' },
];

export default function BlogSection({ posts }: BlogSectionProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [filteredPosts, setFilteredPosts] = useState(posts);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.category === activeTab));
        }
    }, [activeTab, posts]);

    // Duplicate posts for infinite scroll effect
    const displayPosts = [...filteredPosts, ...filteredPosts, ...filteredPosts];

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Title */}
                <h2 className="text-5xl font-bold text-center text-gray-900 mb-8">
                    Tips en informatie
                </h2>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-12">
                    {categoryTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === tab.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Auto-scrolling carousel */}
                <div className="relative">
                    <div className="flex gap-6 animate-scroll">
                        {displayPosts.map((post, index) => (
                            <Link
                                key={`${post.slug}-${index}`}
                                href={`/blog/${post.slug}`}
                                className="flex-shrink-0 w-[400px] group"
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                                        {post.cover_image_url ? (
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-cevace-blue to-blue-400" />
                                        )}
                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-900">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3
                                            className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-cevace-orange transition-colors"
                                            style={{ fontSize: '20px' }}
                                        >
                                            {post.title}
                                        </h3>
                                        {post.published_at && (
                                            <p className="text-sm text-gray-500">
                                                {new Date(post.published_at).toLocaleDateString('nl-NL', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/blog"
                        className="inline-block bg-cevace-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all transform hover:-translate-y-0.5 shadow-lg"
                    >
                        Bekijk alle posts
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-33.333%);
                    }
                }

                .animate-scroll {
                    animation: scroll 40s linear infinite;
                    width: fit-content;
                }

                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
