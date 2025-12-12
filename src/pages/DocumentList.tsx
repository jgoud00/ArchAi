/**
 * DocumentList - List of all rich text documents
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Search } from 'lucide-react';
import { getRichDocuments, createRichDocument, deleteRichDocument } from '@/features/documents/services/richDocuments';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

interface DocumentRecord {
    id: string;
    title: string;
    updated_at: string;
    word_count: number;
}

export const DocumentList = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DocumentRecord | null>(null);

    // Load documents
    const loadDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getRichDocuments();
            setDocuments(data as DocumentRecord[]);
        } catch (error) {
            console.error('Failed to load documents:', error);
            showToast('Failed to load documents', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // Create document
    const handleCreate = useCallback(async () => {
        if (!newTitle.trim()) {
            showToast('Please enter a title', 'warning');
            return;
        }

        try {
            setCreating(true);
            const id = await createRichDocument(newTitle.trim());
            showToast('Document created', 'success');
            navigate(`/documents/${id}`);
        } catch (error) {
            console.error('Failed to create document:', error);
            showToast('Failed to create document', 'error');
        } finally {
            setCreating(false);
            setCreateModalOpen(false);
            setNewTitle('');
        }
    }, [newTitle, navigate, showToast]);

    // Delete document
    const handleDelete = useCallback(async () => {
        if (!itemToDelete) return;

        try {
            await deleteRichDocument(itemToDelete.id);
            showToast('Document deleted', 'success');
            loadDocuments();
        } catch (error) {
            console.error('Failed to delete document:', error);
            showToast('Failed to delete document', 'error');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    }, [itemToDelete, loadDocuments, showToast]);

    // Filter
    const filteredDocuments = documents.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Documents</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and edit rich text documents
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Document
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Document grid */}
            {filteredDocuments.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No documents yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Create your first document to get started
                        </p>
                        <Button onClick={() => setCreateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Document
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocuments.map((doc) => (
                        <Card
                            key={doc.id}
                            className="group cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium truncate">{doc.title}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.word_count} words • Updated {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToDelete(doc);
                                            setDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="New Document"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Title</label>
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Enter document title"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Document"
            >
                <div className="space-y-4">
                    <p>
                        Are you sure you want to delete "{itemToDelete?.title}"?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentList;
