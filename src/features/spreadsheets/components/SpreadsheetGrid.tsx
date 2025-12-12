/**
 * SpreadsheetGrid - Virtualized grid component for Excel-like editing
 * 
 * Features:
 * - Virtualized rendering for performance
 * - Cell selection (single, range)
 * - Keyboard navigation
 * - Inline editing
 * - Column/row resizing
 */

import {
    memo,
    useCallback,
    useRef,
    useState,
    useEffect,
    KeyboardEvent,
    MouseEvent
} from 'react';
import { useSpreadsheetStore, useSpreadsheetHistory } from '@/features/spreadsheets/store/spreadsheetStore';
import { CellRef, CellFormat } from '@/types/spreadsheet';
import { indexToColumn, columnToIndex, parseCellRef, formatCellValue } from '@/utils/formulaParser';
import { cn } from '@/utils/cn';

// Number of rows/cols to render beyond viewport
const OVERSCAN = 5;

interface SpreadsheetGridProps {
    className?: string;
}

export const SpreadsheetGrid = memo(({ className }: SpreadsheetGridProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

    // Store state
    const {
        data,
        selection,
        isEditing,
        editingValue,
        setSelection,
        startEditing,
        stopEditing,
        setEditingValue,
        setCellValue,
        getEvaluatedValue,
        setColumnWidth,
    } = useSpreadsheetStore();

    const { undo, redo } = useSpreadsheetHistory();

    // Calculate visible range
    const getVisibleRange = useCallback(() => {
        let accumulatedWidth = 0;
        let startCol = 0;
        let endCol = 0;

        for (let i = 0; i < data.columns.length; i++) {
            if (accumulatedWidth < scrollOffset.x) {
                startCol = i;
            }
            accumulatedWidth += data.columns[i].width;
            if (accumulatedWidth > scrollOffset.x + viewportSize.width) {
                endCol = i;
                break;
            }
            endCol = i;
        }

        let accumulatedHeight = 0;
        let startRow = 0;
        let endRow = 0;

        for (let i = 0; i < data.rows.length; i++) {
            if (accumulatedHeight < scrollOffset.y) {
                startRow = i;
            }
            accumulatedHeight += data.rows[i].height;
            if (accumulatedHeight > scrollOffset.y + viewportSize.height) {
                endRow = i;
                break;
            }
            endRow = i;
        }

        return {
            startCol: Math.max(0, startCol - OVERSCAN),
            endCol: Math.min(data.columns.length - 1, endCol + OVERSCAN),
            startRow: Math.max(0, startRow - OVERSCAN),
            endRow: Math.min(data.rows.length - 1, endRow + OVERSCAN),
        };
    }, [data.columns, data.rows, scrollOffset, viewportSize]);

    // Handle resize observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setViewportSize({ width, height });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Handle scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollTop } = e.currentTarget;
        setScrollOffset({ x: scrollLeft, y: scrollTop });
    }, []);

    // Handle cell click
    const handleCellClick = useCallback((ref: CellRef, e: MouseEvent) => {
        if (e.shiftKey && selection) {
            // Extend selection
            setSelection({
                ...selection,
                end: ref,
            });
        } else {
            setSelection({
                start: ref,
                end: ref,
                active: ref,
            });
        }
    }, [selection, setSelection]);

    // Handle double-click to edit
    const handleCellDoubleClick = useCallback((ref: CellRef) => {
        setSelection({
            start: ref,
            end: ref,
            active: ref,
        });
        const cell = data.cells[ref];
        startEditing(cell?.formula || String(cell?.value ?? ''));
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [data.cells, setSelection, startEditing]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selection) return;

        const { active } = selection;
        const parsed = parseCellRef(active);
        if (!parsed) return;

        // Undo/Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
            return;
        }

        // Copy/Cut/Paste
        if ((e.ctrlKey || e.metaKey)) {
            if (e.key === 'c') {
                useSpreadsheetStore.getState().copy();
                return;
            }
            if (e.key === 'x') {
                useSpreadsheetStore.getState().cut();
                return;
            }
            if (e.key === 'v') {
                useSpreadsheetStore.getState().paste();
                return;
            }
        }

        // If editing, handle differently
        if (isEditing) {
            if (e.key === 'Enter') {
                e.preventDefault();
                stopEditing(true);
                // Move down
                const newRef = `${parsed.col}${parsed.row + 1}`;
                setSelection({ start: newRef, end: newRef, active: newRef });
            } else if (e.key === 'Escape') {
                e.preventDefault();
                stopEditing(false);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                stopEditing(true);
                // Move right
                const newCol = indexToColumn(columnToIndex(parsed.col) + 1);
                const newRef = `${newCol}${parsed.row}`;
                setSelection({ start: newRef, end: newRef, active: newRef });
            }
            return;
        }

        // Navigation
        let newCol = parsed.col;
        let newRow = parsed.row;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newRow = Math.max(1, parsed.row - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                newRow = Math.min(data.rows.length, parsed.row + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                newCol = indexToColumn(Math.max(0, columnToIndex(parsed.col) - 1));
                break;
            case 'ArrowRight':
                e.preventDefault();
                newCol = indexToColumn(Math.min(data.columns.length - 1, columnToIndex(parsed.col) + 1));
                break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    newCol = indexToColumn(Math.max(0, columnToIndex(parsed.col) - 1));
                } else {
                    newCol = indexToColumn(Math.min(data.columns.length - 1, columnToIndex(parsed.col) + 1));
                }
                break;
            case 'Enter':
                e.preventDefault();
                startEditing();
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                setCellValue(active, null);
                return;
            case 'F2':
                e.preventDefault();
                startEditing();
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            default:
                // Start typing to edit
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    startEditing(e.key);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }
                return;
        }

        const newRef = `${newCol}${newRow}`;
        if (e.shiftKey) {
            setSelection({ ...selection, end: newRef });
        } else {
            setSelection({ start: newRef, end: newRef, active: newRef });
        }
    }, [selection, isEditing, data.rows.length, data.columns.length, setSelection, startEditing, stopEditing, setCellValue, undo, redo]);

    // Calculate total grid size
    const totalWidth = data.columns.reduce((sum, col) => sum + col.width, 0);
    const totalHeight = data.rows.reduce((sum, row) => sum + row.height, 0);

    // Get visible range
    const visibleRange = getVisibleRange();

    // Calculate column positions
    const getColumnPosition = (index: number) => {
        let pos = 0;
        for (let i = 0; i < index; i++) {
            pos += data.columns[i].width;
        }
        return pos;
    };

    // Calculate row positions
    const getRowPosition = (index: number) => {
        let pos = 0;
        for (let i = 0; i < index; i++) {
            pos += data.rows[i].height;
        }
        return pos;
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative overflow-auto bg-background border border-border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                className
            )}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Row header */}
            <div
                className="sticky left-0 z-20 bg-muted"
                style={{ width: 50 }}
            >
                {/* Corner cell */}
                <div
                    className="sticky top-0 z-30 bg-muted border-r border-b border-border flex items-center justify-center text-xs text-muted-foreground"
                    style={{ height: 28, width: 50 }}
                />

                {/* Row headers */}
                {Array.from({ length: visibleRange.endRow - visibleRange.startRow + 1 }, (_, i) => {
                    const rowIndex = visibleRange.startRow + i;
                    const row = data.rows[rowIndex];
                    if (!row) return null;

                    return (
                        <div
                            key={rowIndex}
                            className="absolute left-0 border-r border-b border-border bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium"
                            style={{
                                top: 28 + getRowPosition(rowIndex),
                                height: row.height,
                                width: 50,
                            }}
                        >
                            {row.id}
                        </div>
                    );
                })}
            </div>

            {/* Column headers */}
            <div
                className="sticky top-0 z-20 bg-muted"
                style={{ marginLeft: 50 }}
            >
                {Array.from({ length: visibleRange.endCol - visibleRange.startCol + 1 }, (_, i) => {
                    const colIndex = visibleRange.startCol + i;
                    const col = data.columns[colIndex];
                    if (!col) return null;

                    return (
                        <div
                            key={colIndex}
                            className="absolute top-0 border-r border-b border-border bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium"
                            style={{
                                left: getColumnPosition(colIndex),
                                width: col.width,
                                height: 28,
                            }}
                        >
                            {col.id}
                            {/* Resize handle */}
                            <div
                                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    const startX = e.clientX;
                                    const startWidth = col.width;

                                    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
                                        const delta = moveEvent.clientX - startX;
                                        setColumnWidth(col.id, startWidth + delta);
                                    };

                                    const handleMouseUp = () => {
                                        document.removeEventListener('mousemove', handleMouseMove);
                                        document.removeEventListener('mouseup', handleMouseUp);
                                    };

                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Cells grid */}
            <div
                className="relative"
                style={{
                    width: totalWidth + 50,
                    height: totalHeight + 28,
                    marginTop: 28,
                }}
            >
                {/* Render visible cells */}
                {Array.from({ length: visibleRange.endRow - visibleRange.startRow + 1 }, (_, rowI) => {
                    const rowIndex = visibleRange.startRow + rowI;
                    const row = data.rows[rowIndex];
                    if (!row) return null;

                    return Array.from({ length: visibleRange.endCol - visibleRange.startCol + 1 }, (_, colI) => {
                        const colIndex = visibleRange.startCol + colI;
                        const col = data.columns[colIndex];
                        if (!col) return null;

                        const ref = `${col.id}${row.id}` as CellRef;
                        const cell = data.cells[ref];
                        const value = getEvaluatedValue(ref);
                        const format = cell?.format;

                        const isSelected = selection?.active === ref;
                        const isInRange = !!(selection && isInSelectionRange(ref, selection.start, selection.end));

                        return (
                            <CellComponent
                                key={ref}
                                cellRef={ref}
                                value={value}
                                format={format}
                                isSelected={isSelected}
                                isInRange={isInRange}
                                isEditing={isEditing && isSelected}
                                editingValue={editingValue}
                                left={50 + getColumnPosition(colIndex)}
                                top={getRowPosition(rowIndex)}
                                width={col.width}
                                height={row.height}
                                onClick={handleCellClick}
                                onDoubleClick={handleCellDoubleClick}
                                onEditChange={setEditingValue}
                                inputRef={isSelected ? inputRef : undefined}
                            />
                        );
                    });
                })}
            </div>
        </div>
    );
});

SpreadsheetGrid.displayName = 'SpreadsheetGrid';

// Check if a cell is in selection range
function isInSelectionRange(ref: CellRef, start: CellRef, end: CellRef): boolean {
    const cellParsed = parseCellRef(ref);
    const startParsed = parseCellRef(start);
    const endParsed = parseCellRef(end);

    if (!cellParsed || !startParsed || !endParsed) return false;

    const cellCol = columnToIndex(cellParsed.col);
    const startCol = columnToIndex(startParsed.col);
    const endCol = columnToIndex(endParsed.col);
    const cellRow = cellParsed.row;
    const startRow = startParsed.row;
    const endRow = endParsed.row;

    return (
        cellCol >= Math.min(startCol, endCol) &&
        cellCol <= Math.max(startCol, endCol) &&
        cellRow >= Math.min(startRow, endRow) &&
        cellRow <= Math.max(startRow, endRow)
    );
}

// Individual cell component
interface CellComponentProps {
    cellRef: CellRef;
    value: string | number | boolean | null;
    format?: CellFormat;
    isSelected: boolean;
    isInRange: boolean;
    isEditing: boolean;
    editingValue: string;
    left: number;
    top: number;
    width: number;
    height: number;
    onClick: (ref: CellRef, e: MouseEvent) => void;
    onDoubleClick: (ref: CellRef) => void;
    onEditChange: (value: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
}

const CellComponent = memo(({
    cellRef,
    value,
    format,
    isSelected,
    isInRange,
    isEditing,
    editingValue,
    left,
    top,
    width,
    height,
    onClick,
    onDoubleClick,
    onEditChange,
    inputRef,
}: CellComponentProps) => {
    const displayValue = formatCellValue(value, format?.numberFormat);
    const hasError = typeof value === 'string' && value.startsWith('#');

    return (
        <div
            className={cn(
                "absolute border-r border-b border-border/50 px-1 flex items-center overflow-hidden",
                "cursor-cell select-none",
                isSelected && "ring-2 ring-primary ring-inset z-10",
                isInRange && !isSelected && "bg-primary/10",
                hasError && "text-destructive",
                format?.bold && "font-bold",
                format?.italic && "italic",
                format?.underline && "underline",
            )}
            style={{
                left,
                top,
                width,
                height,
                backgroundColor: format?.backgroundColor || 'transparent',
                color: format?.textColor,
                fontSize: format?.fontSize,
                textAlign: format?.textAlign || 'left',
                justifyContent: format?.textAlign === 'center' ? 'center' : format?.textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}
            onClick={(e) => onClick(cellRef, e)}
            onDoubleClick={() => onDoubleClick(cellRef)}
        >
            {isEditing ? (
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={editingValue}
                    onChange={(e) => onEditChange(e.target.value)}
                    className="w-full h-full bg-background border-none outline-none text-sm px-1"
                    autoFocus
                />
            ) : (
                <span className="truncate text-sm">{displayValue}</span>
            )}
        </div>
    );
});

CellComponent.displayName = 'CellComponent';
