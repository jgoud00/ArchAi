import { memo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * InviteMemberModal - Modal for inviting team members
 */
export const InviteMemberModal = memo(({ isOpen, onClose, form, onSubmit }: InviteMemberModalProps) => {
    const handleClose = () => {
        onClose();
        form.reset();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email *
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="member@example.com"
                        {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                            {String(form.formState.errors.email.message || 'Invalid email')}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                        Role
                    </label>
                    <select
                        id="role"
                        {...form.register('role')}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        defaultValue="viewer"
                    >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                    </select>
                    {form.formState.errors.role && (
                        <p className="text-sm text-destructive">
                            {String(form.formState.errors.role.message || 'Invalid role')}
                        </p>
                    )}
                </div>
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Invite</Button>
                </div>
            </form>
        </Modal>
    );
});

InviteMemberModal.displayName = 'InviteMemberModal';
