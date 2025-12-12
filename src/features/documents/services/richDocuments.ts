/**
 * Rich Document Service - Supabase CRUD for TipTap documents
 * 
 * Handles rich text documents with versioning and export.
 */

import { supabase } from '@/services/supabase';
import {
    Document,
    DocumentContent,
    DocumentVersion,
} from '@/types/document';

// Database record types
interface RichDocumentRecord {
    id: string;
    title: string;
    project_id?: string;
    content: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    word_count: number;
}

interface VersionRecord {
    id: string;
    document_id: string;
    content: string;
    created_at: string;
    created_by: string;
    description?: string;
}

/**
 * Get all rich documents for the current user
 */
export async function getRichDocuments(): Promise<RichDocumentRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('rich_documents')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get a single rich document by ID
 */
export async function getRichDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
        .from('rich_documents')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    if (!data) return null;

    try {
        const content = JSON.parse(data.content) as DocumentContent;
        return {
            meta: {
                id: data.id,
                title: data.title,
                projectId: data.project_id,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                createdBy: data.created_by,
                wordCount: data.word_count || 0,
            },
            content,
        };
    } catch {
        throw new Error('Failed to parse document content');
    }
}

/**
 * Create a new rich document
 */
export async function createRichDocument(title: string, projectId?: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const initialContent: DocumentContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
    };

    const { data, error } = await supabase
        .from('rich_documents')
        .insert({
            title,
            project_id: projectId || null,
            content: JSON.stringify(initialContent),
            created_by: user.id,
            word_count: 0,
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Save rich document
 */
export async function saveRichDocument(doc: Document): Promise<void> {
    const { error } = await supabase
        .from('rich_documents')
        .update({
            title: doc.meta.title,
            content: JSON.stringify(doc.content),
            updated_at: new Date().toISOString(),
            word_count: doc.meta.wordCount,
        })
        .eq('id', doc.meta.id);

    if (error) throw error;
}

/**
 * Delete a rich document
 */
export async function deleteRichDocument(id: string): Promise<void> {
    const { error } = await supabase
        .from('rich_documents')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Create a version snapshot
 */
export async function createDocumentVersion(
    documentId: string,
    content: DocumentContent,
    description?: string
): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('document_versions')
        .insert({
            document_id: documentId,
            content: JSON.stringify(content),
            created_by: user.id,
            description,
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Get document versions
 */
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((v: VersionRecord) => ({
        id: v.id,
        documentId: v.document_id,
        content: JSON.parse(v.content) as DocumentContent,
        createdAt: new Date(v.created_at),
        createdBy: v.created_by,
        description: v.description,
    }));
}

/**
 * Export document to HTML
 */
export function exportToHTML(doc: Document): string {
    const { content } = doc;

    function processNode(node: { type: string; content?: unknown[]; text?: string; marks?: { type: string }[]; attrs?: Record<string, unknown> }): string {
        if (node.text) {
            let text = node.text;
            if (node.marks) {
                for (const mark of node.marks) {
                    switch (mark.type) {
                        case 'bold': text = `<strong>${text}</strong>`; break;
                        case 'italic': text = `<em>${text}</em>`; break;
                        case 'underline': text = `<u>${text}</u>`; break;
                        case 'strike': text = `<s>${text}</s>`; break;
                        case 'code': text = `<code>${text}</code>`; break;
                    }
                }
            }
            return text;
        }

        const children = (node.content as { type: string; content?: unknown[]; text?: string; marks?: { type: string }[]; attrs?: Record<string, unknown> }[] || [])
            .map(processNode).join('');

        switch (node.type) {
            case 'doc': return children;
            case 'paragraph': return `<p>${children}</p>`;
            case 'heading': return `<h${node.attrs?.level || 1}>${children}</h${node.attrs?.level || 1}>`;
            case 'bulletList': return `<ul>${children}</ul>`;
            case 'orderedList': return `<ol>${children}</ol>`;
            case 'listItem': return `<li>${children}</li>`;
            case 'blockquote': return `<blockquote>${children}</blockquote>`;
            case 'codeBlock': return `<pre><code>${children}</code></pre>`;
            case 'horizontalRule': return '<hr>';
            default: return children;
        }
    }

    const html = processNode(content as unknown as { type: string; content?: unknown[] });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${doc.meta.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1, h2, h3 { margin-top: 1.5em; }
    p { line-height: 1.6; }
    blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 1rem; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${doc.meta.title}</h1>
  ${html}
</body>
</html>`;
}

/**
 * Export to Markdown
 */
export function exportToMarkdown(doc: Document): string {
    const { content } = doc;

    function processNode(node: { type: string; content?: unknown[]; text?: string; marks?: { type: string }[]; attrs?: Record<string, unknown> }): string {
        if (node.text) {
            let text = node.text;
            if (node.marks) {
                for (const mark of node.marks) {
                    switch (mark.type) {
                        case 'bold': text = `**${text}**`; break;
                        case 'italic': text = `*${text}*`; break;
                        case 'code': text = `\`${text}\``; break;
                        case 'strike': text = `~~${text}~~`; break;
                    }
                }
            }
            return text;
        }

        const children = (node.content as { type: string; content?: unknown[]; text?: string; marks?: { type: string }[]; attrs?: Record<string, unknown> }[] || [])
            .map(processNode).join('');

        switch (node.type) {
            case 'doc': return children;
            case 'paragraph': return `${children}\n\n`;
            case 'heading': return `${'#'.repeat(node.attrs?.level as number || 1)} ${children}\n\n`;
            case 'bulletList': return (node.content as unknown[] || []).map((n) => `- ${processNode(n as { type: string; content?: unknown[] })}`).join('');
            case 'orderedList': return (node.content as unknown[] || []).map((n, i) => `${i + 1}. ${processNode(n as { type: string; content?: unknown[] })}`).join('');
            case 'listItem': return children.trim() + '\n';
            case 'blockquote': return `> ${children}`;
            case 'codeBlock': return `\`\`\`\n${children}\`\`\`\n\n`;
            case 'horizontalRule': return '---\n\n';
            default: return children;
        }
    }

    return `# ${doc.meta.title}\n\n${processNode(content as unknown as { type: string; content?: unknown[] })}`;
}
