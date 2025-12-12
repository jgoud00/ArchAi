/**
 * Document Type Definitions
 */

// Document content is stored as TipTap JSON
export interface DocumentContent {
    type: 'doc';
    content: TipTapNode[];
}

// TipTap node structure
export interface TipTapNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: TipTapNode[];
    marks?: TipTapMark[];
    text?: string;
}

// TipTap mark (formatting)
export interface TipTapMark {
    type: string;
    attrs?: Record<string, unknown>;
}

// Document metadata
export interface DocumentMeta {
    id: string;
    title: string;
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    wordCount: number;
}

// Complete document
export interface Document {
    meta: DocumentMeta;
    content: DocumentContent;
}

// Document version for history
export interface DocumentVersion {
    id: string;
    documentId: string;
    content: DocumentContent;
    createdAt: Date;
    createdBy: string;
    description?: string;
}

// Document in database
export interface DocumentRecord {
    id: string;
    title: string;
    project_id?: string;
    content: string; // JSON stringified
    created_at: string;
    updated_at: string;
    created_by: string;
    word_count: number;
}

// Document version in database
export interface DocumentVersionRecord {
    id: string;
    document_id: string;
    content: string;
    created_at: string;
    created_by: string;
    description?: string;
}

// Heading for outline
export interface DocumentHeading {
    id: string;
    level: number; // 1-6
    text: string;
    position: number; // Character position in document
}

// Export format
export type ExportFormat = 'pdf' | 'docx' | 'html' | 'markdown';

// Autosave status
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';
