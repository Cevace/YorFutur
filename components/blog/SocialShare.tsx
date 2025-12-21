'use client';

import { useState } from 'react';
import { Linkedin, Share2, Check, MessageCircle } from 'lucide-react';

// Custom X (formerly Twitter) icon
const XIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

interface SocialShareProps {
    url: string;
    title: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Delen:</span>

            <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                aria-label="Deel op LinkedIn"
            >
                <Linkedin size={18} className="text-[#0077B5]" />
            </a>

            <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                aria-label="Deel op X"
            >
                <XIcon size={18} className="text-black" />
            </a>

            <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                aria-label="Deel via WhatsApp"
            >
                <MessageCircle size={18} className="text-[#25D366]" />
            </a>

            <button
                onClick={copyToClipboard}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                aria-label="Kopieer link"
            >
                {copied ? (
                    <Check size={18} className="text-green-500" />
                ) : (
                    <Share2 size={18} className="text-gray-600" />
                )}
            </button>
        </div >
    );
}
