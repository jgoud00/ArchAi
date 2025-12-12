/**
 * Document Zustand Store
 * 
 * Manages document state with autosave and version history.
 */

import { create } from 'zustand';
import {
    Document,
    DocumentContent,
    DocumentHeading,
    AutosaveStatus,
    TipTapNode
} from '@/types/document';

// Default empty document content
const createEmptyContent = (): DocumentContent => ({
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [],
        },
    ],
});

// Create empty document
function createEmptyDocument(): Document {
    return {
        meta: {
            id: '',
            title: 'Untitled Document',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: '',
            wordCount: 0,
        },
        content: createEmptyContent(),
    };
}

interface DocumentState {
    // Document data
    document: Document;

    // Editor state
    isDirty: boolean;
    autosaveStatus: AutosaveStatus;

    // Outline (extracted headings)
    headings: DocumentHeading[];

    // Actions
    setDocument: (doc: Document) => void;
    setContent: (content: DocumentContent) => void;
    setTitle: (title: string) => void;
    updateWordCount: (count: number) => void;

    // Headings
    updateHeadings: (content: DocumentContent) => void;

    // Autosave
    setAutosaveStatus: (status: AutosaveStatus) => void;
    markClean: () => void;
    markDirty: () => void;

    // Reset
    reset: () => void;
}

// Extract headings from document content
function extractHeadings(content: DocumentContent): DocumentHeading[] {
    const headings: DocumentHeading[] = [];
    let position = 0;

    function traverse(nodes: TipTapNode[]): void {
        for (const node of nodes) {
            if (node.type === 'heading' && node.attrs?.level) {
                const text = getNodeText(node);
                if (text) {
                    headings.push({
                        id: `heading-${headings.length}`,
                        level: node.attrs.level as number,
                        text,
                        position,
                    });
                }
            }

            if (node.text) {
                position += node.text.length;
            }

            if (node.content) {
                traverse(node.content);
            }
        }
    }

    if (content.content) {
        traverse(content.content);
    }

    return headings;
}

// Get text content from a node
function getNodeText(node: TipTapNode): string {
    if (node.text) return node.text;
    if (!node.content) return '';
    return node.content.map(getNodeText).join('');
}

// Count words in document
function countWords(content: DocumentContent): number {
    const text = getNodeText({ type: 'doc', content: content.content });
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
}

export const useDocumentStore = create<DocumentState>((set) => ({
    // Initial state
    document: createEmptyDocument(),
    isDirty: false,
    autosaveStatus: 'idle',
    headings: [],

    // Set entire document
    setDocument: (doc) => set({
        document: doc,
        isDirty: false,
        autosaveStatus: 'idle',
        headings: extractHeadings(doc.content),
    }),

    // Set document content
    setContent: (content) => set((state) => {
        const wordCount = countWords(content);
        const headings = extractHeadings(content);

        return {
            document: {
                ...state.document,
                content,
                meta: {
                    ...state.document.meta,
                    wordCount,
                    updatedAt: new Date(),
                },
            },
            isDirty: true,
            headings,
        };
    }),

    // Set document title
    setTitle: (title) => set((state) => ({
        document: {
            ...state.document,
            meta: {
                ...state.document.meta,
                title,
                updatedAt: new Date(),
            },
        },
        isDirty: true,
    })),

    // Update word count
    updateWordCount: (count) => set((state) => ({
        document: {
            ...state.document,
            meta: {
                ...state.document.meta,
                wordCount: count,
            },
        },
    })),

    // Update headings
    updateHeadings: (content) => set({
        headings: extractHeadings(content),
    }),

    // Autosave status
    setAutosaveStatus: (status) => set({ autosaveStatus: status }),

    markClean: () => set({ isDirty: false, autosaveStatus: 'saved' }),

    markDirty: () => set({ isDirty: true }),

    // Reset to empty
    reset: () => set({
        document: createEmptyDocument(),
        isDirty: false,
        autosaveStatus: 'idle',
        headings: [],
    }),
}));
