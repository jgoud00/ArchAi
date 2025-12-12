/**
 * RichTextEditor - TipTap-based rich text editor
 * 
 * Features:
 * - Full formatting (headings, bold, italic, underline)
 * - Lists (bullet, numbered)
 * - Tables
 * - Links and images
 * - Keyboard shortcuts
 */

import { memo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useDocumentStore } from '@/features/documents/store/documentStore';
import { DocumentContent } from '@/types/document';
import { cn } from '@/utils/cn';

interface RichTextEditorProps {
    className?: string;
    editable?: boolean;
    onUpdate?: (content: DocumentContent) => void;
}

export const RichTextEditor = memo(({
    className,
    editable = true,
    onUpdate,
}: RichTextEditorProps) => {
    const { document, setContent } = useDocumentStore();

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full rounded-lg',
                },
            }),
            TextStyle,
            Color,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-border',
                },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2 bg-muted font-bold',
                },
            }),
        ],
        content: document.content,
        editable,
        onUpdate: ({ editor }) => {
            const json = editor.getJSON() as DocumentContent;
            setContent(json);
            onUpdate?.(json);
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none',
                    'focus:outline-none min-h-[500px] p-4',
                    'prose-headings:font-bold prose-headings:text-foreground',
                    'prose-p:text-foreground prose-p:leading-relaxed',
                    'prose-a:text-primary prose-a:underline',
                    'prose-code:bg-muted prose-code:px-1 prose-code:rounded',
                    'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
                    'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4',
                    'prose-ul:list-disc prose-ol:list-decimal',
                ),
            },
        },
    });

    // Update editor content when document changes externally
    useEffect(() => {
        if (editor && document.content && !editor.isFocused) {
            const currentContent = JSON.stringify(editor.getJSON());
            const newContent = JSON.stringify(document.content);
            if (currentContent !== newContent) {
                editor.commands.setContent(document.content);
            }
        }
    }, [editor, document.content]);

    return (
        <div className={cn('bg-card rounded-lg border border-border', className)}>
            <EditorContent editor={editor} />
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';


