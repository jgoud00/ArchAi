import { memo } from 'react';
import { User, Save, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField, FieldError } from '@/components/ui/FormComponents';
import { Spinner } from '@/components/ui/Spinner';
import { UseFormReturn } from 'react-hook-form';

interface ProfileFormData {
    displayName: string;
}

interface ProfileSettingsProps {
    user: {
        email: string;
        avatar?: string | null;
    };
    profileForm: UseFormReturn<ProfileFormData>;
    avatarPreview: string | null;
    uploadingAvatar: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onSubmit: (data: ProfileFormData) => void;
    onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveAvatar: () => void;
}

/**
 * ProfileSettings - Profile section with avatar upload
 */
export const ProfileSettings = memo(({
    user,
    profileForm,
    avatarPreview,
    uploadingAvatar,
    fileInputRef,
    onSubmit,
    onAvatarUpload,
    onRemoveAvatar
}: ProfileSettingsProps) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your profile information</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField>
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </FormField>

                    <div className="space-y-4">
                        {/* Avatar Upload */}
                        <FormField>
                            <label className="text-sm font-medium">Avatar</label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="h-20 w-20 rounded-full object-cover border-2 border-border"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                            <User className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                    )}
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                            <Spinner size="sm" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {avatarPreview ? 'Change' : 'Upload'}
                                    </Button>
                                    {avatarPreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={onRemoveAvatar}
                                            disabled={uploadingAvatar}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={onAvatarUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Upload a profile picture (max 5MB, JPG, PNG, or GIF)
                            </p>
                        </FormField>

                        {/* Display Name */}
                        <FormField>
                            <label htmlFor="displayName" className="text-sm font-medium">
                                Display Name
                            </label>
                            <Input
                                id="displayName"
                                {...profileForm.register('displayName')}
                                className={profileForm.formState.errors.displayName ? 'border-destructive' : ''}
                            />
                            <FieldError>{profileForm.formState.errors.displayName?.message}</FieldError>
                        </FormField>
                    </div>

                    <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
});

ProfileSettings.displayName = 'ProfileSettings';
