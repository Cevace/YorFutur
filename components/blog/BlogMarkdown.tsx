'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';

interface BlogMarkdownProps {
    content: string;
}

// Helper function to generate IDs from heading text
function generateId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}

export default function BlogMarkdown({ content }: BlogMarkdownProps) {
    const components: Components = {
        h2: ({ children, ...props }) => {
            const text = children?.toString() || '';
            const id = generateId(text);
            return (
                <h2 id={id} className="scroll-mt-24" {...props}>
                    {children}
                </h2>
            );
        },
        h3: ({ children, ...props }) => {
            const text = children?.toString() || '';
            const id = generateId(text);
            return (
                <h3 id={id} className="scroll-mt-24" {...props}>
                    {children}
                </h3>
            );
        },
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    );
}
