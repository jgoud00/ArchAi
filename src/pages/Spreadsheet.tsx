/**
 * Spreadsheet Page - Main spreadsheet editor view
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { SpreadsheetGrid, SpreadsheetToolbar, FormulaBar } from '@/features/spreadsheets/components';
import { useSpreadsheetStore } from '@/features/spreadsheets/store/spreadsheetStore';
import {
    getSpreadsheet,
    saveSpreadsheet,
    exportToCSV,
    importFromCSV,
    exportToXLSX,
    importFromXLSX
} from '@/features/spreadsheets/services/spreadsheets';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';


export const Spreadsheet = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { data, setData, isDirty, markClean } = useSpreadsheetStore();

    // Load spreadsheet data
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const spreadsheetData = await getSpreadsheet(id);
                if (spreadsheetData) {
                    setData(spreadsheetData);
                } else {
                    showToast('Spreadsheet not found', 'error');
                    navigate('/spreadsheets');
                }
            } catch (error) {
                console.error('Failed to load spreadsheet:', error);
                showToast('Failed to load spreadsheet', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, setData, showToast, navigate]);

    // Handle save
    const handleSave = useCallback(async () => {
        if (!id) return;

        try {
            setSaving(true);
            await saveSpreadsheet(id, data);
            markClean();
            showToast('Spreadsheet saved', 'success');
        } catch (error) {
            console.error('Failed to save spreadsheet:', error);
            showToast('Failed to save spreadsheet', 'error');
        } finally {
            setSaving(false);
        }
    }, [id, data, markClean, showToast]);

    // Handle export
    const handleExport = useCallback(async () => {
        try {
            // Export to XLSX
            const blob = await exportToXLSX(data);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.meta.name || 'spreadsheet'}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Spreadsheet exported', 'success');
        } catch (error) {
            // Fallback to CSV
            try {
                const csv = exportToCSV(data);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${data.meta.name || 'spreadsheet'}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Spreadsheet exported as CSV', 'success');
            } catch (csvError) {
                console.error('Export failed:', csvError);
                showToast('Failed to export spreadsheet', 'error');
            }
        }
    }, [data, showToast]);

    // Handle import
    const handleImport = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            let updatedData;

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                updatedData = await importFromXLSX(file, data);
            } else if (file.name.endsWith('.csv')) {
                const text = await file.text();
                updatedData = importFromCSV(text, data);
            } else {
                showToast('Unsupported file format. Use CSV or XLSX.', 'warning');
                return;
            }

            setData(updatedData);
            showToast('Data imported successfully', 'success');
        } catch (error) {
            console.error('Import failed:', error);
            showToast('Failed to import file', 'error');
        }

        // Reset input
        e.target.value = '';
    }, [data, setData, showToast]);

    // Handle back with unsaved changes warning
    const handleBack = useCallback(() => {
        if (isDirty) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    }, [isDirty, navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <FileSpreadsheet className="h-6 w-6 text-primary" />

                <div className="flex-1">
                    <h1 className="text-xl font-semibold">{data.meta.name}</h1>
                    {isDirty && (
                        <span className="text-xs text-muted-foreground">Unsaved changes</span>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <SpreadsheetToolbar
                onSave={handleSave}
                onExport={handleExport}
                onImport={handleImport}
                saving={saving}
            />

            {/* Formula Bar */}
            <FormulaBar />

            {/* Grid */}
            <div className="flex-1 overflow-hidden">
                <SpreadsheetGrid className="w-full h-full" />
            </div>

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default Spreadsheet;
