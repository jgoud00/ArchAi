import { useState } from 'react';
import { X, Keyboard, Mouse, Zap, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CADHelpPanelProps {
    onClose: () => void;
}

export const CADHelpPanel = ({ onClose }: CADHelpPanelProps) => {
    const [activeTab, setActiveTab] = useState<'shortcuts' | 'tools' | 'workflow'>('shortcuts');

    const shortcuts = [
        {
            category: 'Drawing Tools', items: [
                { key: 'L', action: 'Line tool' },
                { key: 'R', action: 'Rectangle tool' },
                { key: 'C', action: 'Circle tool' },
                { key: 'W', action: 'Wall placement' },
                { key: 'D', action: 'Door placement' },
                { key: 'M', action: 'Measure tool' },
                { key: 'Esc', action: 'Select tool / Cancel' },
            ]
        },
        {
            category: 'View Controls', items: [
                { key: 'G', action: 'Toggle grid' },
                { key: 'S', action: 'Toggle snap' },
            ]
        },
        {
            category: 'Node Operations', items: [
                { key: 'Delete', action: 'Delete selected' },
                { key: 'Ctrl+D', action: 'Duplicate' },
                { key: 'Ctrl+C', action: 'Copy' },
                { key: 'Ctrl+V', action: 'Paste' },
                { key: 'Ctrl+A', action: 'Select all' },
                { key: 'Shift+Click', action: 'Multi-select' },
            ]
        },
        {
            category: 'Grouping', items: [
                { key: 'Ctrl+G', action: 'Group selected' },
                { key: 'Ctrl+Shift+G', action: 'Ungroup' },
            ]
        },
        {
            category: 'Undo/Redo', items: [
                { key: 'Ctrl+Z', action: 'Undo' },
                { key: 'Ctrl+Y', action: 'Redo' },
            ]
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-dark p-6 rounded-lg shadow-2xl w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Keyboard className="h-6 w-6" />
                        <h2 className="text-xl font-semibold">CAD Blueprint Help</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-border">
                    <button
                        onClick={() => setActiveTab('shortcuts')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'shortcuts'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Keyboard className="h-4 w-4 inline mr-2" />
                        Keyboard Shortcuts
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'tools'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Mouse className="h-4 w-4 inline mr-2" />
                        Tools Guide
                    </button>
                    <button
                        onClick={() => setActiveTab('workflow')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'workflow'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Zap className="h-4 w-4 inline mr-2" />
                        Quick Start
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'shortcuts' && (
                        <div className="space-y-6">
                            {shortcuts.map((category) => (
                                <div key={category.category}>
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                                        {category.category}
                                    </h3>
                                    <div className="space-y-2">
                                        {category.items.map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-2 rounded hover:bg-muted/30">
                                                <span className="text-sm">{item.action}</span>
                                                <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
                                                    {item.key}
                                                </kbd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2">Drawing Tools</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>• <strong>Line (L):</strong> Click start → Click end → Enter dimensions</li>
                                    <li>• <strong>Rectangle (R):</strong> Click corner → Click opposite → Set width/height</li>
                                    <li>• <strong>Circle (C):</strong> Click center → Click edge → Enter radius</li>
                                    <li>• <strong>Measure (M):</strong> Click-to-measure distance between points</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2">Alignment & Transform</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>• Select 2+ nodes to show alignment toolbar</li>
                                    <li>• Align: Left, Center, Right, Top, Middle, Bottom</li>
                                    <li>• Distribute: Horizontal or Vertical spacing</li>
                                    <li>• Transform: Mirror, Flip, Rotate 90°</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2">Grid & Snap</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>• Grid helps align objects visually</li>
                                    <li>• Snap forces placement to grid intersections</li>
                                    <li>• Object snap (when enabled) snaps to node edges/centers</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workflow' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Quick Start Workflow
                                </h4>
                                <ol className="space-y-3 text-sm mt-3">
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">1.</span>
                                        <span>Press <kbd className="px-1 bg-muted rounded text-xs">R</kbd> → Draw room rectangle</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">2.</span>
                                        <span>Drag Wall/Door/Window from sidebar</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">3.</span>
                                        <span>Press <kbd className="px-1 bg-muted rounded text-xs">M</kbd> → Click to measure</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">4.</span>
                                        <span>Select multiple → Align & distribute</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">5.</span>
                                        <span>Group with <kbd className="px-1 bg-muted rounded text-xs">Ctrl+G</kbd></span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-primary">6.</span>
                                        <span>Save or Export blueprint</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold mb-2">Pro Tips</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>💡 Hold <strong>Shift</strong> while clicking to multi-select</li>
                                    <li>💡 Use <strong>Ctrl+D</strong> to quickly duplicate selections</li>
                                    <li>💡 Press <strong>G</strong> to toggle grid visibility</li>
                                    <li>💡 Properties panel shows exact X/Y/W/H coordinates</li>
                                    <li>💡 Measurements persist and save with blueprint</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                    Press <kbd className="px-2 py-1 bg-muted border border-border rounded">?</kbd> or{' '}
                    <kbd className="px-2 py-1 bg-muted border border-border rounded">F1</kbd> to open this help panel
                </div>
            </div>
        </div>
    );
};
