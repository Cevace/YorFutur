'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Eye, Trash2, ToggleLeft, ToggleRight, Plus, Link as LinkIcon } from 'lucide-react';
import { createLiveLinkAction, getUserLiveLinksAction, toggleLiveLinkAction, deleteLiveLinkAction, LiveCVLink } from '@/actions/live-cv';

export default function CVSettingsPage() {
    const [links, setLinks] = useState<LiveCVLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadLinks();
    }, []);

    async function loadLinks() {
        setLoading(true);
        const result = await getUserLiveLinksAction();
        if (result.success && result.data) {
            setLinks(result.data);
        }
        setLoading(false);
    }

    async function handleCreateLink() {
        setCreating(true);
        const result = await createLiveLinkAction();

        if (result.success && result.data) {
            setMessage({ type: 'success', text: 'Live CV link aangemaakt!' });
            await loadLinks();
            navigator.clipboard.writeText(result.data.url);
            setCopiedId(result.data.linkId);
            setTimeout(() => setCopiedId(null), 2000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Kon link niet aanmaken' });
        }

        setCreating(false);
    }

    async function handleToggle(linkId: string, currentStatus: boolean) {
        const result = await toggleLiveLinkAction(linkId, !currentStatus);

        if (result.success) {
            setMessage({ type: 'success', text: currentStatus ? 'Link gedeactiveerd' : 'Link geactiveerd' });
            await loadLinks();
        } else {
            setMessage({ type: 'error', text: result.error || 'Kon status niet wijzigen' });
        }
    }

    async function handleDelete(linkId: string) {
        if (!confirm('Weet je zeker dat je deze link wilt verwijderen?')) return;

        const result = await deleteLiveLinkAction(linkId);

        if (result.success) {
            setMessage({ type: 'success', text: 'Link verwijderd' });
            await loadLinks();
        } else {
            setMessage({ type: 'error', text: result.error || 'Kon link niet verwijderen' });
        }
    }

    function copyToClipboard(url: string, linkId: string) {
        navigator.clipboard.writeText(url);
        setCopiedId(linkId);
        setTimeout(() => setCopiedId(null), 2000);
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="overflow-x-hidden">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Live CV Links</h1>
                <p className="text-gray-600">
                    Deel je CV met een unieke link en track weergaven
                </p>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-green-50 text-green-900 border-green-200'
                    : 'bg-red-50 text-red-900 border-red-200'
                    }`}>
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{message.text}</p>
                        <button
                            onClick={() => setMessage(null)}
                            className="text-sm hover:underline ml-4"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Create Button */}
            <div className="mb-6">
                <button
                    onClick={handleCreateLink}
                    disabled={creating || loading}
                    className="inline-flex items-center gap-2 bg-cevace-orange hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Aanmaken...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            <span>Nieuwe Live Link</span>
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-cevace-blue rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Links laden...</p>
                </div>
            ) : links.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-cevace-blue/10 to-cevace-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ExternalLink className="w-10 h-10 text-cevace-blue" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nog geen live links</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Maak je eerste shareable CV link aan om te beginnen met delen en analytics te tracken.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {links.map((link) => {
                        const fullUrl = `${baseUrl}/cv/${link.slug}`;
                        const isCopied = copiedId === link.id;

                        return (
                            <div
                                key={link.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                            >
                                {/* Top Row: Status & Stats */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${link.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${link.is_active ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
                                            {link.is_active ? 'Actief' : 'Inactief'}
                                        </span>

                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full">
                                            <Eye className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {link.views}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {link.views === 1 ? 'weergave' : 'weergaven'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(link.id, link.is_active)}
                                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                                            title={link.is_active ? 'Deactiveren' : 'Activeren'}
                                        >
                                            {link.is_active ? (
                                                <ToggleRight className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-gray-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Verwijderen"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* URL Section */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <code className="flex-1 text-sm font-mono text-gray-700 truncate">
                                            {fullUrl}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(fullUrl, link.id)}
                                            className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-all"
                                            title="Kopiëren"
                                        >
                                            {isCopied ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                        <a
                                            href={fullUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-all"
                                            title="Openen in nieuw tabblad"
                                        >
                                            <ExternalLink className="w-5 h-5 text-gray-600" />
                                        </a>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <p className="text-xs text-gray-500">
                                    Aangemaakt op {new Date(link.created_at).toLocaleDateString('nl-NL', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
