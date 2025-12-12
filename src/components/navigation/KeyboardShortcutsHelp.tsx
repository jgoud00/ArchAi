import { memo, useState, useEffect } from 'react';
import { Command, X } from 'lucide-react';

interface ShortcutItem {
    keys: string[];
    description: string;
    category: string;
}

const shortcuts: ShortcutItem[] = [
    { keys: ['⌘', 'K'], description: 'Open command palette', category: 'Navigation' },
    { keys: ['⌘', '/'], description: 'Show keyboard shortcuts', category: 'Navigation' },
    { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['G', 'S'], description: 'Go to Settings', category: 'Navigation' },
    { keys: ['G', 'C'], description: 'Go to Calendar', category: 'Navigation' },
    { keys: ['Esc'], description: 'Close modal / Blur input', category: 'General' },
    { keys: ['?'], description: 'Show help', category: 'General' },
];

/**
 * KeyboardShortcutsHelp - Modal showing available keyboard shortcuts
 * 
 * Open with Cmd+/ or ?
 */
export const KeyboardShortcutsHelp = memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    // Listen for Cmd+/ to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === '?' && !e.target) {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    // Group shortcuts by category
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, ShortcutItem[]>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Command className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-foreground">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto space-y-6">
                    {Object.entries(groupedShortcuts).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {items.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-1"
                                    >
                                        <span className="text-sm text-foreground">{shortcut.description}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <span key={keyIndex}>
                                                    {keyIndex > 0 && (
                                                        <span className="text-muted-foreground mx-1">+</span>
                                                    )}
                                                    <kbd className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                                                        {key}
                                                    </kbd>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground text-center">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> to close
                </div>
            </div>
        </div>
    );
});

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';
