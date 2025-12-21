'use client';

import { useState, useEffect } from 'react';
import { BlogPost, getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/actions/blog';
import { generateSlug, calculateReadingTime } from '@/utils/blog';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        category: 'Sollicitatie Tips',
        excerpt: '',
        content: '',
        published: false
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        const { data } = await getBlogPosts(false); // Get all posts, not just published
        if (data) setPosts(data);
        setLoading(false);
    }

    function openModal(post?: BlogPost) {
        if (post) {
            setEditingPost(post);
            setFormData(post);
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                category: 'Sollicitatie Tips',
                excerpt: '',
                content: '',
                published: false
            });
        }
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingPost(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const slug = formData.slug || generateSlug(formData.title || '');
        const reading_time = calculateReadingTime(formData.content || '');

        const postData = {
            ...formData,
            slug,
            reading_time
        } as BlogPost;

        let success = false;
        if (editingPost) {
            const result = await updateBlogPost(editingPost.id!, postData);
            success = result.success;
        } else {
            const result = await createBlogPost(postData);
            success = result.success;
        }

        if (success) {
            await fetchPosts();
            closeModal();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Weet je zeker dat je deze post wilt verwijderen?')) return;

        const result = await deleteBlogPost(id);
        if (result.success) {
            await fetchPosts();
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Blog Beheer</h1>
                        <p className="text-gray-600 mt-2">Beheer je blog posts</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                    >
                        <Plus size={20} />
                        Nieuwe Post
                    </button>
                </div>

                {/* Posts Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Laden...</div>
                    ) : posts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Nog geen blog posts</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700">Titel</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Categorie</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Datum</th>
                                    <th className="text-right p-4 font-semibold text-gray-700">Acties</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{post.title}</div>
                                            <div className="text-sm text-gray-500">{post.slug}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{post.category}</td>
                                        <td className="p-4">
                                            {post.published ? (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                                    <Eye size={14} />
                                                    Gepubliceerd
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                    <EyeOff size={14} />
                                                    Concept
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {post.published_at
                                                ? new Date(post.published_at).toLocaleDateString('nl-NL')
                                                : new Date(post.created_at!).toLocaleDateString('nl-NL')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(post)}
                                                    className="p-2 text-cevace-blue hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id!)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                {editingPost ? 'Post Bewerken' : 'Nieuwe Post'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Slug (auto-generated als leeg)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:outline-none"
                                    placeholder={generateSlug(formData.title || '')}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Categorie *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:outline-none"
                                    required
                                >
                                    <option>Sollicitatie Tips</option>
                                    <option>CV Schrijven</option>
                                    <option>Motivatiebrief</option>
                                    <option>LinkedIn</option>
                                    <option>Carrière</option>
                                    <option>Interview Tips</option>
                                </select>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Samenvatting *</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:outline-none resize-none"
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content (Markdown) *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={15}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:outline-none font-mono text-sm"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Gebruik Markdown formatting</p>
                            </div>

                            {/* Published Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={formData.published}
                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                    className="w-5 h-5 text-cevace-orange focus:ring-cevace-orange border-gray-300 rounded"
                                />
                                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                                    Publiceren
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                                >
                                    {editingPost ? 'Bijwerken' : 'Aanmaken'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
