/**
 * SpreadsheetList - List of all spreadsheets
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileSpreadsheet, Trash2, Search } from 'lucide-react';
import { getSpreadsheets, createSpreadsheet, deleteSpreadsheet } from '@/features/spreadsheets/services/spreadsheets';
import { SpreadsheetRecord } from '@/types/spreadsheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';


export const SpreadsheetList = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [spreadsheets, setSpreadsheets] = useState<SpreadsheetRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Create modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState('');

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<SpreadsheetRecord | null>(null);

    // Load spreadsheets
    const loadSpreadsheets = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSpreadsheets();
            setSpreadsheets(data);
        } catch (error) {
            console.error('Failed to load spreadsheets:', error);
            showToast('Failed to load spreadsheets', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadSpreadsheets();
    }, [loadSpreadsheets]);

    // Create new spreadsheet
    const handleCreate = useCallback(async () => {
        if (!newName.trim()) {
            showToast('Please enter a name', 'warning');
            return;
        }

        try {
            setCreating(true);
            const id = await createSpreadsheet(newName.trim());
            showToast('Spreadsheet created', 'success');
            navigate(`/spreadsheets/${id}`);
        } catch (error) {
            console.error('Failed to create spreadsheet:', error);
            showToast('Failed to create spreadsheet', 'error');
        } finally {
            setCreating(false);
            setCreateModalOpen(false);
            setNewName('');
        }
    }, [newName, navigate, showToast]);

    // Delete spreadsheet
    const handleDelete = useCallback(async () => {
        if (!itemToDelete) return;

        try {
            await deleteSpreadsheet(itemToDelete.id);
            showToast('Spreadsheet deleted', 'success');
            loadSpreadsheets();
        } catch (error) {
            console.error('Failed to delete spreadsheet:', error);
            showToast('Failed to delete spreadsheet', 'error');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    }, [itemToDelete, loadSpreadsheets, showToast]);

    // Filter spreadsheets
    const filteredSpreadsheets = spreadsheets.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Loading state
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
                    <h1 className="text-3xl font-bold">Spreadsheets</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage Excel-like spreadsheets
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Spreadsheet
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search spreadsheets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Spreadsheet grid */}
            {filteredSpreadsheets.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileSpreadsheet className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No spreadsheets yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Create your first spreadsheet to get started
                        </p>
                        <Button onClick={() => setCreateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Spreadsheet
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredSpreadsheets.map((spreadsheet) => (
                        <Card
                            key={spreadsheet.id}
                            className="group cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => navigate(`/spreadsheets/${spreadsheet.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <FileSpreadsheet className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium truncate">{spreadsheet.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                Updated {format(new Date(spreadsheet.updated_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToDelete(spreadsheet);
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
                title="New Spreadsheet"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Name</label>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter spreadsheet name"
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
                title="Delete Spreadsheet"
            >
                <div className="space-y-4">
                    <p>
                        Are you sure you want to delete "{itemToDelete?.name}"?
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

export default SpreadsheetList;
