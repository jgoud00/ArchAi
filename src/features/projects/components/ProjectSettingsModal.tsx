import { memo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProjectSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * ProjectSettingsModal - Modal for editing project settings
 */
export const ProjectSettingsModal = memo(({ isOpen, onClose, form, onSubmit }: ProjectSettingsModalProps) => {
    const handleClose = () => {
        onClose();
        form.reset();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Project Settings">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                        Project Name
                    </label>
                    <Input
                        id="name"
                        {...form.register('name')}
                        className={form.formState.errors.name ? 'border-destructive' : ''}
                    />
                    {form.formState.errors.name && (
                        <p className="text-sm text-destructive">
                            {String(form.formState.errors.name.message || 'Invalid name')}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                        Description
                    </label>
                    <textarea
                        id="description"
                        {...form.register('description')}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    {form.formState.errors.description && (
                        <p className="text-sm text-destructive">
                            {String(form.formState.errors.description.message || 'Invalid description')}
                        </p>
                    )}
                </div>
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
});

ProjectSettingsModal.displayName = 'ProjectSettingsModal';
