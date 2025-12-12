import { memo, ReactNode } from 'react';
import { Collapsible } from '@/components/ui/Collapsible';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';

// ========================================
// Section Components
// ========================================

interface DocSectionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    icon?: ReactNode;
}

/**
 * DocSection - Base documentation section with collapsible content
 */
export const DocSection = memo(({ title, children, defaultOpen = false, icon }: DocSectionProps) => (
    <Collapsible title={title} defaultOpen={defaultOpen}>
        <div className="space-y-4">
            {icon && <div className="flex items-center gap-2 mb-2">{icon}</div>}
            {children}
        </div>
    </Collapsible>
));

DocSection.displayName = 'DocSection';

// ========================================
// Feature Item Component
// ========================================

interface FeatureItemProps {
    title: string;
    description: string;
    complete?: boolean;
}

/**
 * FeatureItem - Feature list item with status indicator
 */
export const FeatureItem = memo(({ title, description, complete = false }: FeatureItemProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            {complete ? (
                <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" aria-hidden="true" />
            )}
            <span className="font-semibold">{title}</span>
        </div>
        <p className="text-sm text-muted-foreground ml-7">{description}</p>
    </div>
));

FeatureItem.displayName = 'FeatureItem';

// ========================================
// Info Card Component
// ========================================

interface InfoCardProps {
    title: string;
    children: ReactNode;
    variant?: 'info' | 'warning' | 'success' | 'error';
}

/**
 * InfoCard - Highlighted information card
 */
export const InfoCard = memo(({ title, children, variant = 'info' }: InfoCardProps) => {
    const variantStyles = {
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    };

    return (
        <div className={`p-4 border rounded-lg ${variantStyles[variant]}`}>
            <h3 className="font-semibold mb-2">{title}</h3>
            {children}
        </div>
    );
});

InfoCard.displayName = 'InfoCard';

// ========================================
// Tech Badge Grid Component
// ========================================

interface TechBadgeGridProps {
    title: string;
    badges: string[];
}

/**
 * TechBadgeGrid - Grid of technology badges
 */
export const TechBadgeGrid = memo(({ title, badges }: TechBadgeGridProps) => (
    <div>
        <h3 className="font-semibold mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <Badge key={badge} variant="outline">{badge}</Badge>
            ))}
        </div>
    </div>
));

TechBadgeGrid.displayName = 'TechBadgeGrid';

// ========================================
// Definition List Component
// ========================================

interface DefinitionItem {
    term: string;
    definition: string;
}

interface DefinitionListProps {
    items: DefinitionItem[];
}

/**
 * DefinitionList - Term and definition list
 */
export const DefinitionList = memo(({ items }: DefinitionListProps) => (
    <dl className="space-y-4">
        {items.map(({ term, definition }) => (
            <div key={term}>
                <dt className="font-semibold mb-1">{term}</dt>
                <dd className="text-muted-foreground">{definition}</dd>
            </div>
        ))}
    </dl>
));

DefinitionList.displayName = 'DefinitionList';

// ========================================
// Bullet List Component
// ========================================

interface BulletListProps {
    title?: string;
    items: string[];
    ordered?: boolean;
}

/**
 * BulletList - Simple bulleted or numbered list
 */
export const BulletList = memo(({ title, items, ordered = false }: BulletListProps) => {
    const ListComponent = ordered ? 'ol' : 'ul';
    const listStyle = ordered ? 'list-decimal' : 'list-disc';

    return (
        <div>
            {title && <h3 className="font-semibold mb-2">{title}</h3>}
            <ListComponent className={`${listStyle} list-inside space-y-1 text-muted-foreground`}>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ListComponent>
        </div>
    );
});

BulletList.displayName = 'BulletList';

// ========================================
// Role Badge Component
// ========================================

interface RoleBadgeProps {
    role: string;
    description: string;
    color: 'blue' | 'green' | 'gray' | 'red' | 'yellow';
}

/**
 * RoleBadge - Role with description
 */
export const RoleBadge = memo(({ role, description, color }: RoleBadgeProps) => {
    const colorStyles = {
        blue: 'bg-blue-50 dark:bg-blue-900/20',
        green: 'bg-green-50 dark:bg-green-900/20',
        gray: 'bg-gray-50 dark:bg-gray-900/20',
        red: 'bg-red-50 dark:bg-red-900/20',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    };

    return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className={colorStyles[color]}>{role}</Badge>
            <span className="text-sm text-muted-foreground">{description}</span>
        </div>
    );
});

RoleBadge.displayName = 'RoleBadge';

// ========================================
// Entity Table Component
// ========================================

interface EntityField {
    name: string;
    type: string;
    description?: string;
}

interface EntityTableProps {
    name: string;
    fields: EntityField[];
}

/**
 * EntityTable - Database entity schema table
 */
export const EntityTable = memo(({ name, fields }: EntityTableProps) => (
    <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" aria-hidden="true" />
            {name}
        </div>
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2">Field</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2 hidden md:table-cell">Description</th>
                </tr>
            </thead>
            <tbody>
                {fields.map((field) => (
                    <tr key={field.name} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-mono text-xs">{field.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{field.type}</td>
                        <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">
                            {field.description || '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));

EntityTable.displayName = 'EntityTable';

// ========================================
// Workflow Step Component
// ========================================

interface WorkflowStepProps {
    step: number;
    title: string;
    description: string;
}

/**
 * WorkflowStep - Numbered workflow step
 */
export const WorkflowStep = memo(({ step, title, description }: WorkflowStepProps) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {step}
        </div>
        <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
));

WorkflowStep.displayName = 'WorkflowStep';

// ========================================
// FAQ Item Component
// ========================================

interface FAQItemProps {
    question: string;
    answer: string;
}

/**
 * FAQItem - Frequently asked question with answer
 */
export const FAQItem = memo(({ question, answer }: FAQItemProps) => (
    <Collapsible title={question}>
        <p className="text-muted-foreground">{answer}</p>
    </Collapsible>
));

FAQItem.displayName = 'FAQItem';


