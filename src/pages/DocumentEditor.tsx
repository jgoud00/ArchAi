/**
 * DocumentEditor Page - Rich text document editor
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
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
import { EditorContent } from '@tiptap/react';
import { ArrowLeft, FileText, Download, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { FormatToolbar, OutlinePanel } from '@/features/documents/components';
import { useDocumentStore } from '@/features/documents/store/documentStore';
import {
    getRichDocument,
    saveRichDocument,
    exportToHTML,
    exportToMarkdown
} from '@/features/documents/services/richDocuments';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { DocumentContent } from '@/types/document';
import { cn } from '@/utils/cn';

// Debounce delay for autosave (ms)
const AUTOSAVE_DELAY = 2000;

export const DocumentEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showOutline, setShowOutline] = useState(true);
    const [editingTitle, setEditingTitle] = useState(false);

    const {
        document,
        setDocument,
        setContent,
        setTitle,
        isDirty,
        markClean,
        autosaveStatus,
        setAutosaveStatus,
    } = useDocumentStore();

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'max-w-full rounded-lg' },
            }),
            TextStyle,
            Color,
            Table.configure({
                resizable: true,
                HTMLAttributes: { class: 'border-collapse border border-border' },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: { class: 'border border-border p-2' },
            }),
            TableHeader.configure({
                HTMLAttributes: { class: 'border border-border p-2 bg-muted font-bold' },
            }),
        ],
        content: document.content,
        onUpdate: ({ editor }) => {
            const json = editor.getJSON() as DocumentContent;
            setContent(json);
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none',
                    'focus:outline-none min-h-[500px] p-6',
                    'prose-headings:font-bold prose-headings:text-foreground',
                    'prose-p:text-foreground prose-p:leading-relaxed',
                ),
            },
        },
    });

    // Load document
    useEffect(() => {
        const loadDoc = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const doc = await getRichDocument(id);
                if (doc) {
                    setDocument(doc);
                    editor?.commands.setContent(doc.content);
                } else {
                    showToast('Document not found', 'error');
                    navigate('/documents');
                }
            } catch (error) {
                console.error('Failed to load document:', error);
                showToast('Failed to load document', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadDoc();
    }, [id, setDocument, showToast, navigate, editor]);

    // Autosave on content change
    useEffect(() => {
        if (!isDirty || !id) return;

        // Clear existing timer
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
        }

        // Set new autosave timer
        autosaveTimerRef.current = setTimeout(async () => {
            try {
                setAutosaveStatus('saving');
                await saveRichDocument(document);
                markClean();
                setAutosaveStatus('saved');
            } catch (error) {
                console.error('Autosave failed:', error);
                setAutosaveStatus('error');
            }
        }, AUTOSAVE_DELAY);

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [isDirty, document, id, markClean, setAutosaveStatus]);

    // Manual save
    const handleSave = useCallback(async () => {
        if (!id) return;

        try {
            setSaving(true);
            await saveRichDocument(document);
            markClean();
            showToast('Document saved', 'success');
        } catch (error) {
            console.error('Save failed:', error);
            showToast('Failed to save document', 'error');
        } finally {
            setSaving(false);
        }
    }, [id, document, markClean, showToast]);

    // Export handlers
    const handleExportHTML = useCallback(() => {
        const html = exportToHTML(document);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.meta.title}.html`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported as HTML', 'success');
    }, [document, showToast]);

    const handleExportMarkdown = useCallback(() => {
        const md = exportToMarkdown(document);
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.meta.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported as Markdown', 'success');
    }, [document, showToast]);

    // Title editing
    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, [setTitle]);

    const handleTitleBlur = useCallback(() => {
        setEditingTitle(false);
    }, []);

    // Back navigation
    const handleBack = useCallback(() => {
        if (isDirty) {
            if (confirm('You have unsaved changes. Save before leaving?')) {
                handleSave().then(() => navigate(-1));
                return;
            }
        }
        navigate(-1);
    }, [isDirty, handleSave, navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <FileText className="h-6 w-6 text-primary" />

                <div className="flex-1">
                    {editingTitle ? (
                        <Input
                            value={document.meta.title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                            className="text-xl font-semibold h-auto py-1"
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setEditingTitle(true)}
                        >
                            {document.meta.title}
                        </h1>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {autosaveStatus === 'saving' && <span>Saving...</span>}
                        {autosaveStatus === 'saved' && <span>All changes saved</span>}
                        {autosaveStatus === 'error' && <span className="text-destructive">Save failed</span>}
                        {isDirty && autosaveStatus === 'idle' && <span>Unsaved changes</span>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleExportMarkdown}>
                        <Download className="h-4 w-4 mr-1" />
                        MD
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExportHTML}>
                        <Download className="h-4 w-4 mr-1" />
                        HTML
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowOutline(!showOutline)}
                        title={showOutline ? 'Hide outline' : 'Show outline'}
                    >
                        {showOutline ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                    </Button>
                    <Button onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <FormatToolbar editor={editor} />

            {/* Editor + Outline */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 overflow-y-auto bg-background">
                    <div className="max-w-4xl mx-auto">
                        <EditorContent editor={editor} className="min-h-full" />
                    </div>
                </div>

                {/* Outline Panel */}
                {showOutline && (
                    <OutlinePanel className="w-64 hidden lg:block" />
                )}
            </div>
        </div>
    );
};

export default DocumentEditor;
