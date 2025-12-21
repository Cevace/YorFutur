'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type BlogContentProps = {
    content: string;
};

export default function BlogContent({ content }: BlogContentProps) {
    return (
        <div className="prose prose-lg max-w-none
            prose-headings:text-cevace-blue prose-headings:font-bold
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-cevace-orange prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:list-disc prose-ol:list-decimal
            prose-li:text-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-cevace-orange 
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
            prose-img:rounded-xl prose-img:shadow-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
