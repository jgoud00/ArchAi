import { useDocumentStore } from '@/features/documents/store/documentStore';

// Export editor instance hook for external control
export function useRichTextEditor() {
    return useDocumentStore();
}
