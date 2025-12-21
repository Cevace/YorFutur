import React from 'react';

type TextNode = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
};

type ElementNode = {
    type: string;
    children: (TextNode | ElementNode)[];
    level?: number;
    listType?: string;
    href?: string;
    [key: string]: any;
};

type DocumentNode = TextNode | ElementNode;

type CustomBlogRendererProps = {
    document: DocumentNode[];
    headingIds?: string[];
};

const CustomBlogRenderer: React.FC<CustomBlogRendererProps> = ({ document, headingIds = [] }) => {
    let headingIndex = 0;

    const renderNode = (node: DocumentNode, index: number): React.ReactNode => {
        // Check if it's a text node
        if ('text' in node) {
            let text: React.ReactNode = node.text;

            // Apply bold
            if (node.bold) {
                text = <strong key={index}>{text}</strong>;
            }

            // Apply italic
            if (node.italic) {
                text = <em key={index}>{text}</em>;
            }

            // Apply code
            if (node.code) {
                text = <code key={index}>{text}</code>;
            }

            return text;
        }

        // Element node - render children
        const children = node.children?.map((child, i) => renderNode(child, i));

        // Heading - with ID for TOC
        if (node.type === 'heading') {
            const level = node.level || 2;
            const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
            const headingId = headingIds[headingIndex];
            headingIndex++;

            return (
                <HeadingTag
                    key={index}
                    id={headingId}
                    className="scroll-mt-20"
                >
                    {children}
                </HeadingTag>
            );
        }

        // Paragraph
        if (node.type === 'paragraph') {
            return <p key={index}>{children}</p>;
        }

        // Unordered List
        if (node.type === 'unordered-list') {
            return <ul key={index}>{children}</ul>;
        }

        // Ordered List
        if (node.type === 'ordered-list') {
            return <ol key={index}>{children}</ol>;
        }

        // List Item
        if (node.type === 'list-item') {
            return <li key={index}>{children}</li>;
        }

        // Link  
        if (node.type === 'link') {
            return (
                <a
                    key={index}
                    href={node.href}
                    target={node.href?.startsWith('http') ? '_blank' : undefined}
                    rel={node.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                    {children}
                </a>
            );
        }

        // Blockquote - Styled as callout
        if (node.type === 'blockquote') {
            return (
                <div
                    key={index}
                    className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg"
                >
                    <div className="text-blue-900">
                        {children}
                    </div>
                </div>
            );
        }

        // Code block
        if (node.type === 'code-block') {
            return (
                <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{children}</code>
                </pre>
            );
        }

        // Default: just return children in fragment
        return <React.Fragment key={index}>{children}</React.Fragment>;
    };

    return (
        <div>
            {document.map((node, index) => renderNode(node, index))}
        </div>
    );
};

export default CustomBlogRenderer;
