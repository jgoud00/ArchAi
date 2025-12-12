import { memo } from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField, FieldError } from '@/components/ui/FormComponents';
import { UseFormReturn } from 'react-hook-form';

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordSettingsProps {
    passwordForm: UseFormReturn<PasswordFormData>;
    onSubmit: (data: PasswordFormData) => void;
}

/**
 * PasswordSettings - Password change section
 */
export const PasswordSettings = memo(({
    passwordForm,
    onSubmit
}: PasswordSettingsProps) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Key className="h-5 w-5" />
                    <div>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField>
                        <label htmlFor="currentPassword" className="text-sm font-medium">
                            Current Password
                        </label>
                        <Input
                            id="currentPassword"
                            type="password"
                            {...passwordForm.register('currentPassword')}
                        />
                        <FieldError>{passwordForm.formState.errors.currentPassword?.message}</FieldError>
                    </FormField>

                    <FormField>
                        <label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                        </label>
                        <Input
                            id="newPassword"
                            type="password"
                            {...passwordForm.register('newPassword')}
                        />
                        <FieldError>{passwordForm.formState.errors.newPassword?.message}</FieldError>
                    </FormField>

                    <FormField>
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm New Password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...passwordForm.register('confirmPassword')}
                        />
                        <FieldError>{passwordForm.formState.errors.confirmPassword?.message}</FieldError>
                    </FormField>

                    <Button type="submit">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
});

PasswordSettings.displayName = 'PasswordSettings';
