/**
 * Spreadsheet Zustand Store
 * 
 * Manages spreadsheet state with undo/redo support using temporal middleware.
 */

import { create } from 'zustand';
import { temporal } from 'zundo';
import {
    Cell,
    CellRef,
    CellFormat,
    SpreadsheetData,
    Selection,
    ColumnDef,
    RowDef,
    SortConfig,
    FilterConfig,
    ClipboardData,
    CellValue
} from '@/types/spreadsheet';
import { evaluateFormula, isFormula, indexToColumn, columnToIndex, parseCellRef } from '@/utils/formulaParser';

// Default column width and row height
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_COLS = 26; // A-Z
const DEFAULT_ROWS = 100;

// Generate default columns A-Z
function generateDefaultColumns(): ColumnDef[] {
    return Array.from({ length: DEFAULT_COLS }, (_, i) => ({
        id: indexToColumn(i),
        width: DEFAULT_COL_WIDTH,
    }));
}

// Generate default rows 1-100
function generateDefaultRows(): RowDef[] {
    return Array.from({ length: DEFAULT_ROWS }, (_, i) => ({
        id: i + 1,
        height: DEFAULT_ROW_HEIGHT,
    }));
}

// Initial empty spreadsheet
function createEmptySpreadsheet(): SpreadsheetData {
    return {
        meta: {
            id: '',
            name: 'Untitled Spreadsheet',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: '',
        },
        cells: {},
        columns: generateDefaultColumns(),
        rows: generateDefaultRows(),
        frozenRows: 0,
        frozenColumns: 0,
        activeSheet: 'Sheet1',
        sheets: [{ id: 'Sheet1', name: 'Sheet1' }],
    };
}

interface SpreadsheetState {
    // Data
    data: SpreadsheetData;

    // Selection
    selection: Selection | null;
    isEditing: boolean;
    editingValue: string;

    // Clipboard
    clipboard: ClipboardData | null;

    // Filters & Sorts
    sortConfig: SortConfig | null;
    filters: FilterConfig[];

    // UI State
    isDirty: boolean;

    // Actions
    setData: (data: SpreadsheetData) => void;
    setCellValue: (ref: CellRef, value: CellValue) => void;
    setCellFormula: (ref: CellRef, formula: string) => void;
    setCellFormat: (ref: CellRef, format: Partial<CellFormat>) => void;
    setRangeFormat: (startRef: CellRef, endRef: CellRef, format: Partial<CellFormat>) => void;

    // Selection
    setSelection: (selection: Selection | null) => void;
    startEditing: (value?: string) => void;
    stopEditing: (save?: boolean) => void;
    setEditingValue: (value: string) => void;

    // Row/Column operations
    insertRow: (afterIndex: number) => void;
    deleteRow: (index: number) => void;
    insertColumn: (afterIndex: number) => void;
    deleteColumn: (index: number) => void;
    setColumnWidth: (colId: string, width: number) => void;
    setRowHeight: (rowIndex: number, height: number) => void;

    // Clipboard
    copy: () => void;
    cut: () => void;
    paste: () => void;

    // Sorting & Filtering
    setSortConfig: (config: SortConfig | null) => void;
    addFilter: (filter: FilterConfig) => void;
    removeFilter: (column: string) => void;
    clearFilters: () => void;

    // Computed
    getCellValue: (ref: CellRef) => CellValue;
    getEvaluatedValue: (ref: CellRef) => CellValue;

    // Utility
    reset: () => void;
    markClean: () => void;
}

export const useSpreadsheetStore = create<SpreadsheetState>()(
    temporal(
        (set, get) => ({
            // Initial state
            data: createEmptySpreadsheet(),
            selection: null,
            isEditing: false,
            editingValue: '',
            clipboard: null,
            sortConfig: null,
            filters: [],
            isDirty: false,

            // Set entire spreadsheet data
            setData: (data) => set({ data, isDirty: false }),

            // Set cell value
            setCellValue: (ref, value) => set((state) => {
                const cells = { ...state.data.cells };
                const existingCell = cells[ref] || {};

                cells[ref] = {
                    ...existingCell,
                    value,
                    formula: undefined, // Clear formula when setting value directly
                    error: undefined,
                };

                return {
                    data: {
                        ...state.data,
                        cells,
                        meta: { ...state.data.meta, updatedAt: new Date() },
                    },
                    isDirty: true,
                };
            }),

            // Set cell formula
            setCellFormula: (ref, formula) => set((state) => {
                const cells = { ...state.data.cells };
                const existingCell = cells[ref] || {};

                // Evaluate formula immediately
                const getCellValue = (cellRef: CellRef) => {
                    const cell = state.data.cells[cellRef];
                    return cell?.value ?? null;
                };

                const evaluated = evaluateFormula(formula, getCellValue);
                const hasError = typeof evaluated === 'string' && evaluated.startsWith('#');

                cells[ref] = {
                    ...existingCell,
                    formula,
                    value: hasError ? null : evaluated,
                    error: hasError ? evaluated as string : undefined,
                };

                return {
                    data: {
                        ...state.data,
                        cells,
                        meta: { ...state.data.meta, updatedAt: new Date() },
                    },
                    isDirty: true,
                };
            }),

            // Set cell format
            setCellFormat: (ref, format) => set((state) => {
                const cells = { ...state.data.cells };
                const existingCell = cells[ref] || { value: null };

                cells[ref] = {
                    ...existingCell,
                    format: { ...existingCell.format, ...format },
                };

                return {
                    data: { ...state.data, cells },
                    isDirty: true,
                };
            }),

            // Set format for a range
            setRangeFormat: (startRef, endRef, format) => set((state) => {
                const cells = { ...state.data.cells };
                const start = parseCellRef(startRef);
                const end = parseCellRef(endRef);

                if (!start || !end) return state;

                const startCol = columnToIndex(start.col);
                const endCol = columnToIndex(end.col);
                const startRow = start.row;
                const endRow = end.row;

                for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
                    for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
                        const ref = `${indexToColumn(c)}${r}`;
                        const existingCell = cells[ref] || { value: null };
                        cells[ref] = {
                            ...existingCell,
                            format: { ...existingCell.format, ...format },
                        };
                    }
                }

                return {
                    data: { ...state.data, cells },
                    isDirty: true,
                };
            }),

            // Selection
            setSelection: (selection) => set({ selection }),

            startEditing: (value) => set((state) => {
                const cellValue = state.selection
                    ? get().getCellValue(state.selection.active)
                    : null;
                return {
                    isEditing: true,
                    editingValue: value ?? String(cellValue ?? ''),
                };
            }),

            stopEditing: (save = true) => {
                const state = get();
                if (save && state.selection && state.editingValue !== '') {
                    const value = state.editingValue;
                    if (isFormula(value)) {
                        get().setCellFormula(state.selection.active, value);
                    } else {
                        // Try to parse as number
                        const num = Number(value);
                        get().setCellValue(state.selection.active, isNaN(num) ? value : num);
                    }
                }
                set({ isEditing: false, editingValue: '' });
            },

            setEditingValue: (value) => set({ editingValue: value }),

            // Row operations
            insertRow: (afterIndex) => set((state) => {
                const rows = [...state.data.rows];
                rows.splice(afterIndex + 1, 0, {
                    id: rows.length + 1,
                    height: DEFAULT_ROW_HEIGHT,
                });

                // Renumber rows
                rows.forEach((row, i) => { row.id = i + 1; });

                return {
                    data: { ...state.data, rows },
                    isDirty: true,
                };
            }),

            deleteRow: (index) => set((state) => {
                if (state.data.rows.length <= 1) return state;

                const rows = state.data.rows.filter((_, i) => i !== index);
                rows.forEach((row, i) => { row.id = i + 1; });

                // Remove cells in this row
                const cells = { ...state.data.cells };
                Object.keys(cells).forEach(ref => {
                    const parsed = parseCellRef(ref);
                    if (parsed && parsed.row === index + 1) {
                        delete cells[ref];
                    }
                });

                return {
                    data: { ...state.data, rows, cells },
                    isDirty: true,
                };
            }),

            // Column operations
            insertColumn: (afterIndex) => set((state) => {
                const columns = [...state.data.columns];
                const newColId = indexToColumn(columns.length);
                columns.splice(afterIndex + 1, 0, {
                    id: newColId,
                    width: DEFAULT_COL_WIDTH,
                });

                // Re-id columns
                columns.forEach((col, i) => { col.id = indexToColumn(i); });

                return {
                    data: { ...state.data, columns },
                    isDirty: true,
                };
            }),

            deleteColumn: (index) => set((state) => {
                if (state.data.columns.length <= 1) return state;

                const deletedColId = state.data.columns[index].id;
                const columns = state.data.columns.filter((_, i) => i !== index);
                columns.forEach((col, i) => { col.id = indexToColumn(i); });

                // Remove cells in this column
                const cells = { ...state.data.cells };
                Object.keys(cells).forEach(ref => {
                    const parsed = parseCellRef(ref);
                    if (parsed && parsed.col === deletedColId) {
                        delete cells[ref];
                    }
                });

                return {
                    data: { ...state.data, columns, cells },
                    isDirty: true,
                };
            }),

            setColumnWidth: (colId, width) => set((state) => ({
                data: {
                    ...state.data,
                    columns: state.data.columns.map(col =>
                        col.id === colId ? { ...col, width: Math.max(40, width) } : col
                    ),
                },
            })),

            setRowHeight: (rowIndex, height) => set((state) => ({
                data: {
                    ...state.data,
                    rows: state.data.rows.map((row, i) =>
                        i === rowIndex ? { ...row, height: Math.max(20, height) } : row
                    ),
                },
            })),

            // Clipboard
            copy: () => {
                const state = get();
                if (!state.selection) return;

                const { start, end } = state.selection;
                const cells: Record<CellRef, Cell> = {};

                const startParsed = parseCellRef(start);
                const endParsed = parseCellRef(end);
                if (!startParsed || !endParsed) return;

                const startCol = columnToIndex(startParsed.col);
                const endCol = columnToIndex(endParsed.col);
                const startRow = startParsed.row;
                const endRow = endParsed.row;

                for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
                    for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
                        const ref = `${indexToColumn(c)}${r}`;
                        if (state.data.cells[ref]) {
                            cells[ref] = { ...state.data.cells[ref] };
                        }
                    }
                }

                set({
                    clipboard: {
                        cells,
                        range: `${start}:${end}`,
                        isCut: false,
                    },
                });
            },

            cut: () => {
                get().copy();
                set((state) => ({
                    clipboard: state.clipboard ? { ...state.clipboard, isCut: true } : null,
                }));
            },

            paste: () => set((state) => {
                if (!state.clipboard || !state.selection) return state;

                const cells = { ...state.data.cells };
                const targetParsed = parseCellRef(state.selection.active);
                if (!targetParsed) return state;

                // Calculate offset from original range
                const rangeParts = state.clipboard.range.split(':');
                const sourceParsed = parseCellRef(rangeParts[0]);
                if (!sourceParsed) return state;

                const rowOffset = targetParsed.row - sourceParsed.row;
                const colOffset = columnToIndex(targetParsed.col) - columnToIndex(sourceParsed.col);

                // Paste cells with offset
                Object.entries(state.clipboard.cells).forEach(([ref, cell]) => {
                    const parsed = parseCellRef(ref);
                    if (parsed) {
                        const newCol = indexToColumn(columnToIndex(parsed.col) + colOffset);
                        const newRow = parsed.row + rowOffset;
                        const newRef = `${newCol}${newRow}`;
                        cells[newRef] = { ...cell };
                    }
                });

                // If cut, remove original cells
                if (state.clipboard.isCut) {
                    Object.keys(state.clipboard.cells).forEach(ref => {
                        delete cells[ref];
                    });
                }

                return {
                    data: { ...state.data, cells },
                    clipboard: state.clipboard.isCut ? null : state.clipboard,
                    isDirty: true,
                };
            }),

            // Sorting
            setSortConfig: (config) => set({ sortConfig: config }),

            // Filtering
            addFilter: (filter) => set((state) => ({
                filters: [...state.filters.filter(f => f.column !== filter.column), filter],
            })),

            removeFilter: (column) => set((state) => ({
                filters: state.filters.filter(f => f.column !== column),
            })),

            clearFilters: () => set({ filters: [] }),

            // Get raw cell value
            getCellValue: (ref) => {
                const state = get();
                const cell = state.data.cells[ref];
                return cell?.value ?? null;
            },

            // Get evaluated value (for formulas)
            getEvaluatedValue: (ref) => {
                const state = get();
                const cell = state.data.cells[ref];

                if (!cell) return null;
                if (cell.error) return cell.error;
                if (cell.formula) {
                    const getCellValue = (cellRef: CellRef) => {
                        const c = state.data.cells[cellRef];
                        return c?.value ?? null;
                    };
                    return evaluateFormula(cell.formula, getCellValue);
                }
                return cell.value;
            },

            // Reset to empty
            reset: () => set({
                data: createEmptySpreadsheet(),
                selection: null,
                isEditing: false,
                editingValue: '',
                clipboard: null,
                sortConfig: null,
                filters: [],
                isDirty: false,
            }),

            markClean: () => set({ isDirty: false }),
        }),
        {
            // Temporal (undo/redo) configuration
            partialize: (state) => ({
                data: state.data,
            }),
            limit: 50,
        }
    )
);

// Utility hook for undo/redo
export const useSpreadsheetHistory = () => {
    return useSpreadsheetStore.temporal.getState();
};
