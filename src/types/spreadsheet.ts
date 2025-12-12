/**
 * Spreadsheet Type Definitions
 */

// Cell value can be string, number, boolean, or null
export type CellValue = string | number | boolean | null;

// Cell format options
export interface CellFormat {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
    borderLeft?: string;
    numberFormat?: string; // e.g., '0.00', '$#,##0.00', '0%'
}

// Individual cell data
export interface Cell {
    value: CellValue;
    formula?: string; // e.g., '=SUM(A1:A10)'
    format?: CellFormat;
    error?: string; // e.g., '#REF!', '#VALUE!'
}

// Column definition
export interface ColumnDef {
    id: string; // 'A', 'B', 'C', etc.
    width: number;
    hidden?: boolean;
}

// Row definition
export interface RowDef {
    id: number;
    height: number;
    hidden?: boolean;
}

// Cell reference in format 'A1', 'B2', etc.
export type CellRef = string;

// Cell range in format 'A1:B10'
export type CellRange = string;

// Selection state
export interface Selection {
    start: CellRef;
    end: CellRef;
    active: CellRef; // The cell being edited
}

// Sort configuration
export interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

// Filter configuration
export interface FilterConfig {
    column: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'isEmpty';
    value: CellValue;
    value2?: CellValue; // For 'between' operator
}

// Spreadsheet metadata
export interface SpreadsheetMeta {
    id: string;
    name: string;
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

// Complete spreadsheet data
export interface SpreadsheetData {
    meta: SpreadsheetMeta;
    cells: Record<CellRef, Cell>; // Sparse representation
    columns: ColumnDef[];
    rows: RowDef[];
    frozenRows: number;
    frozenColumns: number;
    activeSheet: string;
    sheets: SheetTab[];
}

// Sheet tab for multi-sheet support
export interface SheetTab {
    id: string;
    name: string;
    color?: string;
}

// Clipboard data for copy/paste
export interface ClipboardData {
    cells: Record<CellRef, Cell>;
    range: CellRange;
    isCut: boolean;
}

// Spreadsheet in database
export interface SpreadsheetRecord {
    id: string;
    name: string;
    project_id?: string;
    data: string; // JSON stringified SpreadsheetData
    created_at: string;
    updated_at: string;
    created_by: string;
}

// Formula function signature
export type FormulaFunction = (args: CellValue[], getCellValue: (ref: CellRef) => CellValue) => CellValue;

// Undo/Redo action
export interface SpreadsheetAction {
    type: string;
    payload: unknown;
    timestamp: number;
}
