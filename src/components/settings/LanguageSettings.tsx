import { memo, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormComponents';

interface LanguageSettingsProps {
    currentLanguage: string;
    onLanguageChange: (lng: string) => void;
}

/**
 * LanguageSettings - Language selection section
 */
export const LanguageSettings = memo(({
    currentLanguage,
    onLanguageChange
}: LanguageSettingsProps) => {
    const handleChange = useCallback((lng: string) => {
        onLanguageChange(lng);
    }, [onLanguageChange]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                        <CardTitle>Language</CardTitle>
                        <CardDescription>Customize your app language</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField>
                    <label className="text-sm font-medium">Language</label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={currentLanguage === 'en' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleChange('en')}
                        >
                            English
                        </Button>
                        <Button
                            type="button"
                            variant={currentLanguage === 'hi' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleChange('hi')}
                        >
                            हिंदी
                        </Button>
                        <Button
                            type="button"
                            variant={currentLanguage === 'te' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleChange('te')}
                        >
                            తెలుగు
                        </Button>
                    </div>
                </FormField>
            </CardContent>
        </Card>
    );
});

LanguageSettings.displayName = 'LanguageSettings';
