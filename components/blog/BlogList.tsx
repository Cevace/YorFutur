'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogPost } from '@/lib/blog';

interface BlogListProps {
    posts: BlogPost[];
}

const POSTS_PER_PAGE = 9;

function capitalizeFirstWord(str: string): string {
    if (!str) return '';
    const words = str.split(' ');
    return words.map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
    ).join(' ');
}

export default function BlogList({ posts }: BlogListProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const categories = ['Alle', ...Array.from(new Set(posts.map(post => post.category)))];

    const filteredPosts = selectedCategory === 'Alle'
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1); // Reset to page 1 when changing category
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                            ? 'bg-[#4A4E69] text-white shadow-md'
                            : 'bg-white text-[#4A4E69] border border-[#4A4E69]/20 hover:border-[#4A4E69] hover:bg-gray-50'
                            }`}
                    >
                        {category === 'Alle' ? 'Alle' : capitalizeFirstWord(category)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {paginatedPosts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg" style={{ color: '#000000' }}>Geen blog posts gevonden in deze categorie.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedPosts.map((post) => (
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
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#e7e8ea', color: '#000000' }}>
                                        {capitalizeFirstWord(post.category)}
                                    </span>
                                </div>

                                <h2 className="font-bold mb-3 group-hover:text-cevace-blue transition-colors line-clamp-2" style={{ fontSize: '20px', lineHeight: '1.4', color: '#000000' }}>
                                    {post.title}
                                </h2>

                                <p className="text-sm mb-4 line-clamp-3" style={{ color: '#000000' }}>
                                    {post.excerpt}
                                </p>

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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full bg-white border border-gray-200 hover:border-[#4A4E69] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${currentPage === page
                                    ? 'bg-[#4A4E69] text-white shadow-md'
                                    : 'bg-white text-[#4A4E69] border border-gray-200 hover:border-[#4A4E69]'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full bg-white border border-gray-200 hover:border-[#4A4E69] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
