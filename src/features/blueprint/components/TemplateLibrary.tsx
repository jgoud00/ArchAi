import { memo } from 'react';
import { useTemplateStore } from '@/store/templateStore';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { FileText, Home, Building2, Factory } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface TemplateLibraryProps {
    open: boolean;
    onClose: () => void;
}

/**
 * TemplateLibrary - Browse and load pre-made blueprint templates
 */
export const TemplateLibrary = memo(({ open, onClose }: TemplateLibraryProps) => {
    const { templates, loadTemplate } = useTemplateStore();
    const { setNodes, setEdges } = useBlueprintStore();

    const categoryIcons = {
        residential: Home,
        commercial: Building2,
        industrial: Factory,
        custom: FileText,
    };

    const handleLoadTemplate = (templateId: string) => {
        const data = loadTemplate(templateId);
        if (data) {
            setNodes(data.nodes);
            setEdges(data.edges);
            onClose();
        }
    };

    const groupedTemplates = templates.reduce((acc, template) => {
        if (!acc[template.category]) {
            acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
    }, {} as Record<string, typeof templates>);

    return (
        <Modal isOpen={open} onClose={onClose} title="Template Library" className="sm:max-w-[800px]">
            <div className="py-4">
                {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
                    const Icon = categoryIcons[category as keyof typeof categoryIcons];
                    return (
                        <div key={category} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className="h-4 w-4" />
                                <h3 className="font-semibold capitalize">{category}</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {categoryTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleLoadTemplate(template.id)}
                                        className="p-4 border rounded-lg hover:border-primary hover:bg-accent/50 transition-colors text-left group"
                                    >
                                        <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                                            <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                        <h4 className="font-medium text-sm">{template.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
});

TemplateLibrary.displayName = 'TemplateLibrary';
