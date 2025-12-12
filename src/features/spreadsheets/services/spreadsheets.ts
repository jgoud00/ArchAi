/**
 * Spreadsheet Service - Supabase CRUD operations
 */

import { supabase } from '@/services/supabase';
import { SpreadsheetData, SpreadsheetRecord } from '@/types/spreadsheet';

/**
 * Get all spreadsheets for the current user
 */
export async function getSpreadsheets(): Promise<SpreadsheetRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('spreadsheets')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get a single spreadsheet by ID
 */
export async function getSpreadsheet(id: string): Promise<SpreadsheetData | null> {
    const { data, error } = await supabase
        .from('spreadsheets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    if (!data) return null;

    try {
        return JSON.parse(data.data) as SpreadsheetData;
    } catch {
        throw new Error('Failed to parse spreadsheet data');
    }
}

/**
 * Create a new spreadsheet
 */
export async function createSpreadsheet(name: string, projectId?: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const initialData: SpreadsheetData = {
        meta: {
            id: '',
            name,
            projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: user.id,
        },
        cells: {},
        columns: Array.from({ length: 26 }, (_, i) => ({
            id: String.fromCharCode(65 + i),
            width: 100,
        })),
        rows: Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            height: 28,
        })),
        frozenRows: 0,
        frozenColumns: 0,
        activeSheet: 'Sheet1',
        sheets: [{ id: 'Sheet1', name: 'Sheet1' }],
    };

    const { data, error } = await supabase
        .from('spreadsheets')
        .insert({
            name,
            project_id: projectId || null,
            data: JSON.stringify(initialData),
            created_by: user.id,
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Save spreadsheet data
 */
export async function saveSpreadsheet(id: string, spreadsheetData: SpreadsheetData): Promise<void> {
    const { error } = await supabase
        .from('spreadsheets')
        .update({
            name: spreadsheetData.meta.name,
            data: JSON.stringify(spreadsheetData),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Delete a spreadsheet
 */
export async function deleteSpreadsheet(id: string): Promise<void> {
    const { error } = await supabase
        .from('spreadsheets')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Export spreadsheet to CSV format
 */
export function exportToCSV(data: SpreadsheetData): string {
    const { cells, columns, rows } = data;

    const lines: string[] = [];

    for (const row of rows) {
        const values: string[] = [];
        for (const col of columns) {
            const ref = `${col.id}${row.id}`;
            const cell = cells[ref];
            let value = cell?.value ?? '';

            // Escape quotes and wrap in quotes if needed
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }

            values.push(String(value));
        }
        lines.push(values.join(','));
    }

    return lines.join('\n');
}

/**
 * Import CSV to spreadsheet data
 */
export function importFromCSV(csv: string, existingData: SpreadsheetData): SpreadsheetData {
    const lines = csv.split('\n');
    const cells = { ...existingData.cells };

    lines.forEach((line, rowIndex) => {
        const values = parseCSVLine(line);
        values.forEach((value, colIndex) => {
            if (colIndex < existingData.columns.length) {
                const ref = `${existingData.columns[colIndex].id}${rowIndex + 1}`;
                const numValue = Number(value);
                cells[ref] = {
                    value: isNaN(numValue) || value === '' ? value : numValue,
                };
            }
        });
    });

    return {
        ...existingData,
        cells,
        meta: {
            ...existingData.meta,
            updatedAt: new Date(),
        },
    };
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

/**
 * Export to XLSX format (requires xlsx library)
 */
export async function exportToXLSX(data: SpreadsheetData): Promise<Blob> {
    // Dynamic import for code splitting
    const XLSX = await import('xlsx');

    const { cells, columns, rows } = data;

    // Build 2D array
    const aoa: (string | number | boolean | null)[][] = [];

    for (const row of rows) {
        const rowData: (string | number | boolean | null)[] = [];
        for (const col of columns) {
            const ref = `${col.id}${row.id}`;
            const cell = cells[ref];
            rowData.push(cell?.value ?? null);
        }
        aoa.push(rowData);
    }

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, data.activeSheet);

    // Generate buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Import from XLSX file
 */
export async function importFromXLSX(file: File, existingData: SpreadsheetData): Promise<SpreadsheetData> {
    const XLSX = await import('xlsx');

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });

    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(firstSheet, { header: 1 });

    const cells = { ...existingData.cells };

    aoa.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (colIndex < existingData.columns.length) {
                const ref = `${existingData.columns[colIndex].id}${rowIndex + 1}`;
                cells[ref] = {
                    value: value ?? null,
                };
            }
        });
    });

    return {
        ...existingData,
        cells,
        meta: {
            ...existingData.meta,
            updatedAt: new Date(),
        },
    };
}
