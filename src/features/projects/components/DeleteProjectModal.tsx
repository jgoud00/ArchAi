import { memo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * DeleteProjectModal - Confirmation modal for project deletion
 */
export const DeleteProjectModal = memo(({ isOpen, onClose, onConfirm }: DeleteProjectModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="font-medium">Are you sure you want to delete this project?</p>
                </div>
                <p className="text-sm text-muted-foreground">
                    This action cannot be undone. All scans and team data will be permanently deleted.
                </p>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete Project
                    </Button>
                </div>
            </div>
        </Modal>
    );
});

DeleteProjectModal.displayName = 'DeleteProjectModal';
