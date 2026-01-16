'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List } from 'lucide-react';

type SimpleRichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SimpleRichTextEditor({ value, onChange, placeholder = 'Schrijf je profiel...' }: SimpleRichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initialize editor content on mount
    useEffect(() => {
        if (editorRef.current && value && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput(); // Update state after command
    };

    const formatButton = (command: string, icon: React.ReactNode, title: string) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                execCommand(command);
            }}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title={title}
        >
            {icon}
        </button>
    );

    return (
        <div className={`border rounded-lg overflow-hidden transition-colors ${isFocused ? 'border-cevace-blue ring-2 ring-cevace-blue/20' : 'border-gray-300'}`}>
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
                {formatButton('bold', <Bold size={18} />, 'Vetgedrukt (Ctrl+B)')}
                {formatButton('italic', <Italic size={18} />, 'Cursief (Ctrl+I)')}
                {formatButton('insertUnorderedList', <List size={18} />, 'Opsommingstekens')}
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="p-4 min-h-[150px] focus:outline-none rich-text-editor"
                data-placeholder={placeholder}
            />

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                .rich-text-editor {
                    font-size: 14px;
                    line-height: 1.5;
                }
                .rich-text-editor :global(ul) {
                    list-style-type: disc !important;
                    list-style-position: outside !important;
                    padding-left: 1.5rem !important;
                    margin: 0.5rem 0 !important;
                    display: block !important;
                }
                .rich-text-editor :global(li) {
                    display: list-item !important;
                    margin: 0.25rem 0 !important;
                    list-style-type: disc !important;
                }
                .rich-text-editor :global(strong) {
                    font-weight: 700 !important;
                }
                .rich-text-editor :global(em) {
                    font-style: italic !important;
                }
            `}</style>
        </div>
    );
}
