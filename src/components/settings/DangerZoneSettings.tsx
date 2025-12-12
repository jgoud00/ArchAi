import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DangerZoneSettingsProps {
    onDeleteAccount: () => void;
}

/**
 * DangerZoneSettings - Dangerous actions section
 */
export const DangerZoneSettings = memo(({
    onDeleteAccount
}: DangerZoneSettingsProps) => {
    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Delete Account</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={onDeleteAccount}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

DangerZoneSettings.displayName = 'DangerZoneSettings';
