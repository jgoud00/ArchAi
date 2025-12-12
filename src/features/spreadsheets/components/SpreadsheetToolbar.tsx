/**
 * SpreadsheetToolbar - Formatting and action toolbar
 */

import { memo, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo2,
    Redo2,
    Plus,
    Trash2,
    Download,
    Upload,
    Save,
    Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSpreadsheetStore, useSpreadsheetHistory } from '@/features/spreadsheets/store/spreadsheetStore';
import { cn } from '@/utils/cn';

interface SpreadsheetToolbarProps {
    onSave?: () => void;
    onExport?: () => void;
    onImport?: () => void;
    saving?: boolean;
    className?: string;
}

export const SpreadsheetToolbar = memo(({
    onSave,
    onExport,
    onImport,
    saving,
    className,
}: SpreadsheetToolbarProps) => {
    const {
        selection,
        data,
        setRangeFormat,
        insertRow,
        deleteRow,
        insertColumn,
        isDirty,
    } = useSpreadsheetStore();

    const { undo, redo, pastStates, futureStates } = useSpreadsheetHistory();

    // Apply format to selection
    const applyFormat = useCallback((format: Parameters<typeof setRangeFormat>[2]) => {
        if (!selection) return;
        setRangeFormat(selection.start, selection.end, format);
    }, [selection, setRangeFormat]);

    // Get current cell format
    const currentFormat = selection ? data.cells[selection.active]?.format : undefined;

    return (
        <div className={cn(
            "flex items-center gap-1 p-2 bg-card border-b border-border",
            className
        )}>
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => undo()}
                    disabled={pastStates.length === 0}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => redo()}
                    disabled={futureStates.length === 0}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Text formatting */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <Button
                    variant={currentFormat?.bold ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => applyFormat({ bold: !currentFormat?.bold })}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant={currentFormat?.italic ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => applyFormat({ italic: !currentFormat?.italic })}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant={currentFormat?.underline ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => applyFormat({ underline: !currentFormat?.underline })}
                    title="Underline (Ctrl+U)"
                >
                    <Underline className="h-4 w-4" />
                </Button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <Button
                    variant={currentFormat?.textAlign === 'left' ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => applyFormat({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant={currentFormat?.textAlign === 'center' ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => applyFormat({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant={currentFormat?.textAlign === 'right' ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => applyFormat({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <div className="relative">
                    <Button variant="ghost" size="icon" title="Text Color">
                        <Palette className="h-4 w-4" />
                    </Button>
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => applyFormat({ textColor: e.target.value })}
                        title="Text Color"
                    />
                </div>
                <div className="relative">
                    <Button variant="ghost" size="icon" title="Background Color">
                        <div className="h-4 w-4 rounded border border-border bg-gradient-to-br from-yellow-200 to-yellow-400" />
                    </Button>
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => applyFormat({ backgroundColor: e.target.value })}
                        title="Background Color"
                    />
                </div>
            </div>

            {/* Row/Column operations */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const rowIndex = selection ? parseInt(selection.active.slice(1)) - 1 : data.rows.length - 1;
                        insertRow(rowIndex);
                    }}
                    title="Insert Row"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Row
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const colIndex = selection ? data.columns.findIndex(c => c.id === selection.active[0]) : data.columns.length - 1;
                        insertColumn(colIndex);
                    }}
                    title="Insert Column"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Col
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        if (!selection) return;
                        const rowIndex = parseInt(selection.active.slice(1)) - 1;
                        deleteRow(rowIndex);
                    }}
                    title="Delete Row"
                    disabled={!selection}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Import/Export */}
            <div className="flex items-center gap-1">
                {onImport && (
                    <Button variant="ghost" size="sm" onClick={onImport}>
                        <Upload className="h-4 w-4 mr-1" />
                        Import
                    </Button>
                )}
                {onExport && (
                    <Button variant="ghost" size="sm" onClick={onExport}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                    </Button>
                )}
                {onSave && (
                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={!isDirty || saving}
                    >
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                )}
            </div>
        </div>
    );
});

SpreadsheetToolbar.displayName = 'SpreadsheetToolbar';
