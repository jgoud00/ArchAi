/**
 * FormatToolbar - Rich text formatting toolbar
 * 
 * Provides formatting controls for the TipTap editor.
 */

import { memo, useCallback, useState } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    Undo2,
    Redo2,
    Minus,
    Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface FormatToolbarProps {
    editor: Editor | null;
    className?: string;
}

export const FormatToolbar = memo(({ editor, className }: FormatToolbarProps) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    // Toggle link
    const handleSetLink = useCallback(() => {
        if (!editor) return;
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    }, [editor, linkUrl]);

    // Add image
    const handleAddImage = useCallback(() => {
        if (!editor) return;
        const url = prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    // Insert table
    const handleInsertTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className={cn(
            'flex items-center gap-1 p-2 bg-card border-b border-border flex-wrap',
            className
        )}>
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Text formatting */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <Underline className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Blocks */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Rule"
                >
                    <Minus className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Insert */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <ToolbarButton
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    active={editor.isActive('link')}
                    title="Add Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={handleAddImage} title="Add Image">
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={handleInsertTable} title="Insert Table">
                    <TableIcon className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Text color */}
            <div className="flex items-center gap-0.5">
                <div className="relative">
                    <ToolbarButton onClick={() => { }} title="Text Color">
                        <Palette className="h-4 w-4" />
                    </ToolbarButton>
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                        title="Text Color"
                    />
                </div>
            </div>

            {/* Link input */}
            {showLinkInput && (
                <div className="flex items-center gap-2 ml-2">
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Enter URL..."
                        className="px-2 py-1 text-sm border border-border rounded bg-background"
                        onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
                    />
                    <Button size="sm" onClick={handleSetLink}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>Cancel</Button>
                </div>
            )}
        </div>
    );
});

FormatToolbar.displayName = 'FormatToolbar';

// Helper component for toolbar buttons
interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
}

const ToolbarButton = memo(({ onClick, active, disabled, title, children }: ToolbarButtonProps) => (
    <Button
        variant={active ? 'secondary' : 'ghost'}
        size="icon"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="h-8 w-8"
    >
        {children}
    </Button>
));

ToolbarButton.displayName = 'ToolbarButton';
