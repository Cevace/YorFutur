import React from 'react';
import Link from 'next/link';
import TableOfContents from './TableOfContents';

type TOCItem = {
    id: string;
    text: string;
    level: number;
};

type BlogSidebarProps = {
    content: string;
};

const BlogSidebar: React.FC<BlogSidebarProps> = ({ content }) => {
    return (
        <aside className="space-y-6">
            <div className="sticky top-8 space-y-6">
                {/* Table of Contents */}
                <TableOfContents content={content} />

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-cevace-blue to-blue-900 rounded-lg p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">
                        Klaar om je sollicitatie te verbeteren?
                    </h3>
                    <p className="text-blue-200 text-sm mb-4">
                        Gebruik onze AI-powered tools om je CV te optimaliseren en op te vallen bij recruiters.
                    </p>
                    <Link
                        href="/dashboard"
                        className="block w-full bg-cevace-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
                    >
                        Start nu gratis
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default BlogSidebar;
