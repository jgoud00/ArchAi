/**
 * Formula Parser and Evaluator
 * 
 * Supports basic Excel-like formulas:
 * - Arithmetic: +, -, *, /, ^
 * - Functions: SUM, AVERAGE, MIN, MAX, COUNT, IF, CONCAT
 * - Cell references: A1, B2:D4
 */

import { CellValue, CellRef } from '@/types/spreadsheet';

// Parse cell reference to row and column
export function parseCellRef(ref: CellRef): { col: string; row: number } | null {
    const match = ref.match(/^([A-Z]+)(\d+)$/i);
    if (!match) return null;
    return { col: match[1].toUpperCase(), row: parseInt(match[2], 10) };
}

// Convert column letter to index (A=0, B=1, ..., Z=25, AA=26)
export function columnToIndex(col: string): number {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
        index = index * 26 + (col.charCodeAt(i) - 64);
    }
    return index - 1;
}

// Convert index to column letter
export function indexToColumn(index: number): string {
    let col = '';
    let i = index + 1;
    while (i > 0) {
        const remainder = (i - 1) % 26;
        col = String.fromCharCode(65 + remainder) + col;
        i = Math.floor((i - 1) / 26);
    }
    return col;
}

// Parse cell range to array of cell references
export function parseRange(range: string): CellRef[] {
    const parts = range.split(':');
    if (parts.length === 1) {
        return [parts[0].toUpperCase()];
    }

    const start = parseCellRef(parts[0]);
    const end = parseCellRef(parts[1]);
    if (!start || !end) return [];

    const startCol = columnToIndex(start.col);
    const endCol = columnToIndex(end.col);
    const startRow = start.row;
    const endRow = end.row;

    const refs: CellRef[] = [];
    for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
        for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
            refs.push(`${indexToColumn(c)}${r}`);
        }
    }
    return refs;
}

// Built-in formula functions
const FORMULA_FUNCTIONS: Record<string, (args: CellValue[]) => CellValue> = {
    SUM: (args) => {
        const nums = args.filter((v): v is number => typeof v === 'number');
        return nums.reduce((a, b) => a + b, 0);
    },

    AVERAGE: (args) => {
        const nums = args.filter((v): v is number => typeof v === 'number');
        if (nums.length === 0) return 0;
        return nums.reduce((a, b) => a + b, 0) / nums.length;
    },

    MIN: (args) => {
        const nums = args.filter((v): v is number => typeof v === 'number');
        if (nums.length === 0) return 0;
        return Math.min(...nums);
    },

    MAX: (args) => {
        const nums = args.filter((v): v is number => typeof v === 'number');
        if (nums.length === 0) return 0;
        return Math.max(...nums);
    },

    COUNT: (args) => {
        return args.filter((v) => v !== null && v !== '').length;
    },

    COUNTA: (args) => {
        return args.filter((v) => v !== null).length;
    },

    IF: (args) => {
        const [condition, trueVal, falseVal] = args;
        return condition ? (trueVal ?? true) : (falseVal ?? false);
    },

    CONCAT: (args) => {
        return args.map(String).join('');
    },

    ABS: (args) => {
        const num = Number(args[0]);
        return isNaN(num) ? '#VALUE!' : Math.abs(num);
    },

    ROUND: (args) => {
        const num = Number(args[0]);
        const decimals = Number(args[1]) || 0;
        if (isNaN(num)) return '#VALUE!';
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    NOW: () => new Date().toISOString(),

    TODAY: () => new Date().toISOString().split('T')[0],

    LEN: (args) => String(args[0] || '').length,

    UPPER: (args) => String(args[0] || '').toUpperCase(),

    LOWER: (args) => String(args[0] || '').toLowerCase(),

    TRIM: (args) => String(args[0] || '').trim(),
};

// Tokenize formula string
function tokenize(formula: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < formula.length; i++) {
        const char = formula[i];

        if (inString) {
            current += char;
            if (char === stringChar) {
                tokens.push(current);
                current = '';
                inString = false;
            }
            continue;
        }

        if (char === '"' || char === "'") {
            if (current) tokens.push(current);
            current = char;
            inString = true;
            stringChar = char;
            continue;
        }

        if ('+-*/^(),:<>='.includes(char)) {
            if (current) tokens.push(current);
            tokens.push(char);
            current = '';
            continue;
        }

        if (char === ' ') {
            if (current) tokens.push(current);
            current = '';
            continue;
        }

        current += char;
    }

    if (current) tokens.push(current);
    return tokens;
}

// Evaluate formula
export function evaluateFormula(
    formula: string,
    getCellValue: (ref: CellRef) => CellValue,
    visitedCells: Set<string> = new Set()
): CellValue {
    // Remove leading =
    const expr = formula.startsWith('=') ? formula.slice(1).trim() : formula.trim();

    if (!expr) return null;

    try {
        const tokens = tokenize(expr);
        return evaluateTokens(tokens, getCellValue, visitedCells);
    } catch (error) {
        return error instanceof Error ? `#ERROR: ${error.message}` : '#ERROR!';
    }
}

function evaluateTokens(
    tokens: string[],
    getCellValue: (ref: CellRef) => CellValue,
    visitedCells: Set<string>
): CellValue {
    if (tokens.length === 0) return null;

    // Check for function call
    if (tokens.length >= 3 && tokens[1] === '(') {
        const funcName = tokens[0].toUpperCase();
        const func = FORMULA_FUNCTIONS[funcName];

        if (func) {
            // Find matching closing paren
            let depth = 0;
            let endIndex = -1;
            for (let i = 1; i < tokens.length; i++) {
                if (tokens[i] === '(') depth++;
                if (tokens[i] === ')') depth--;
                if (depth === 0) {
                    endIndex = i;
                    break;
                }
            }

            if (endIndex === -1) return '#SYNTAX!';

            // Parse arguments
            const argTokens = tokens.slice(2, endIndex);
            const args = parseArguments(argTokens, getCellValue, visitedCells);

            return func(args);
        }
    }

    // Single token - could be cell ref, number, or string
    if (tokens.length === 1) {
        return evaluateSingleToken(tokens[0], getCellValue, visitedCells);
    }

    // Handle operators
    return evaluateExpression(tokens, getCellValue, visitedCells);
}

function evaluateSingleToken(
    token: string,
    getCellValue: (ref: CellRef) => CellValue,
    visitedCells: Set<string>
): CellValue {
    // String literal
    if ((token.startsWith('"') && token.endsWith('"')) ||
        (token.startsWith("'") && token.endsWith("'"))) {
        return token.slice(1, -1);
    }

    // Number
    const num = Number(token);
    if (!isNaN(num)) {
        return num;
    }

    // Boolean
    if (token.toUpperCase() === 'TRUE') return true;
    if (token.toUpperCase() === 'FALSE') return false;

    // Cell reference
    if (/^[A-Z]+\d+$/i.test(token)) {
        const ref = token.toUpperCase();

        // Check for circular reference
        if (visitedCells.has(ref)) {
            return '#CIRCULAR!';
        }

        return getCellValue(ref);
    }

    // Cell range - expand and return array
    if (token.includes(':')) {
        const refs = parseRange(token);
        return refs.map(ref => getCellValue(ref)).filter(v => v !== null)[0] ?? null;
    }

    return token;
}

function parseArguments(
    tokens: string[],
    getCellValue: (ref: CellRef) => CellValue,
    visitedCells: Set<string>
): CellValue[] {
    const args: CellValue[] = [];
    let current: string[] = [];
    let depth = 0;

    for (const token of tokens) {
        if (token === '(') depth++;
        if (token === ')') depth--;

        if (token === ',' && depth === 0) {
            if (current.length > 0) {
                args.push(evaluateTokens(current, getCellValue, visitedCells));
            }
            current = [];
        } else {
            current.push(token);
        }
    }

    if (current.length > 0) {
        // Check if it's a range
        const joined = current.join('');
        if (joined.includes(':')) {
            const refs = parseRange(joined);
            refs.forEach(ref => args.push(getCellValue(ref)));
        } else {
            args.push(evaluateTokens(current, getCellValue, visitedCells));
        }
    }

    return args;
}

function evaluateExpression(
    tokens: string[],
    getCellValue: (ref: CellRef) => CellValue,
    visitedCells: Set<string>
): CellValue {
    // Simple left-to-right evaluation with operator precedence
    const values: CellValue[] = [];
    const operators: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if ('+-*/^'.includes(token)) {
            operators.push(token);
        } else if (token !== '(' && token !== ')') {
            values.push(evaluateSingleToken(token, getCellValue, visitedCells));
        }
    }

    // Apply operators
    let result = Number(values[0]) || 0;
    for (let i = 0; i < operators.length; i++) {
        const op = operators[i];
        const val = Number(values[i + 1]) || 0;

        switch (op) {
            case '+': result += val; break;
            case '-': result -= val; break;
            case '*': result *= val; break;
            case '/': result = val !== 0 ? result / val : '#DIV/0!' as unknown as number; break;
            case '^': result = Math.pow(result, val); break;
        }
    }

    return result;
}

// Check if a string is a valid formula
export function isFormula(value: string): boolean {
    return typeof value === 'string' && value.startsWith('=');
}

// Format cell value for display
export function formatCellValue(value: CellValue, format?: string): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'string') return value;

    if (typeof value === 'number') {
        if (!format) return String(value);

        // Basic number formatting
        if (format === '0.00') return value.toFixed(2);
        if (format === '0%') return `${(value * 100).toFixed(0)}%`;
        if (format === '0.00%') return `${(value * 100).toFixed(2)}%`;
        if (format === '$#,##0.00') return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (format === '#,##0') return value.toLocaleString('en-US');

        return String(value);
    }

    return String(value);
}
