import { useState } from 'react';
import { useBlueprintStore } from '@/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { X, Download, FileImage, FileCode, Printer } from 'lucide-react';
import { exportToSVG, exportToPNG, exportToDXF, downloadFile, generatePrintLayout } from '@/utils/exportHelpers';

type ExportFormat = 'svg' | 'png' | 'dxf' | 'print';

interface ExportDialogProps {
    onClose: () => void;
}

export const ExportDialog = ({ onClose }: ExportDialogProps) => {
    const { nodes, edges } = useBlueprintStore();
    const [format, setFormat] = useState<ExportFormat>('png');
    const [filename, setFilename] = useState('blueprint');
    const [scale, setScale] = useState('2');
    const [exportScale, setExportScale] = useState('1:100');
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            switch (format) {
                case 'svg': {
                    const svg = exportToSVG(nodes, edges);
                    downloadFile(svg, `${filename}.svg`, 'image/svg+xml');
                    break;
                }
                case 'png': {
                    const blob = await exportToPNG('blueprint-canvas', parseInt(scale));
                    if (blob) {
                        downloadFile(blob, `${filename}.png`, 'image/png');
                    }
                    break;
                }
                case 'dxf': {
                    const dxf = exportToDXF(nodes, edges);
                    downloadFile(dxf, `${filename}.dxf`, 'application/dxf');
                    break;
                }
                case 'print': {
                    const printHtml = generatePrintLayout(nodes, exportScale);
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(printHtml);
                        printWindow.document.close();
                        setTimeout(() => printWindow.print(), 500);
                    }
                    break;
                }
            }
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-dark p-6 rounded-lg shadow-2xl w-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Export Blueprint</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Format Selection */}
                    <div>
                        <Label className="text-sm mb-3 block">Export Format</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFormat('png')}
                                className={`p-4 rounded-lg border-2 transition-all ${format === 'png'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <FileImage className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium">PNG</div>
                                <div className="text-xs text-muted-foreground">Raster image</div>
                            </button>

                            <button
                                onClick={() => setFormat('svg')}
                                className={`p-4 rounded-lg border-2 transition-all ${format === 'svg'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <FileCode className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium">SVG</div>
                                <div className="text-xs text-muted-foreground">Vector graphic</div>
                            </button>

                            <button
                                onClick={() => setFormat('dxf')}
                                className={`p-4 rounded-lg border-2 transition-all ${format === 'dxf'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <FileCode className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium">DXF</div>
                                <div className="text-xs text-muted-foreground">AutoCAD</div>
                            </button>

                            <button
                                onClick={() => setFormat('print')}
                                className={`p-4 rounded-lg border-2 transition-all ${format === 'print'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <Printer className="h-6 w-6 mx-auto mb-2" />
                                <div className="font-medium">Print</div>
                                <div className="text-xs text-muted-foreground">Print layout</div>
                            </button>
                        </div>
                    </div>

                    {/* Filename */}
                    {format !== 'print' && (
                        <div>
                            <Label className="text-sm">Filename</Label>
                            <Input
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                placeholder="blueprint"
                                className="mt-1"
                            />
                        </div>
                    )}

                    {/* PNG Scale */}
                    {format === 'png' && (
                        <div>
                            <Label className="text-sm">Quality Scale</Label>
                            <select
                                value={scale}
                                onChange={(e) => setScale(e.target.value)}
                                className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background"
                            >
                                <option value="1">1x (Standard)</option>
                                <option value="2">2x (High Quality)</option>
                                <option value="3">3x (Ultra Quality)</option>
                                <option value="4">4x (Print Quality)</option>
                            </select>
                        </div>
                    )}

                    {/* Drawing Scale */}
                    {(format === 'svg' || format === 'dxf' || format === 'print') && (
                        <div>
                            <Label className="text-sm">Drawing Scale</Label>
                            <select
                                value={exportScale}
                                onChange={(e) => setExportScale(e.target.value)}
                                className="w-full mt-1 h-10 px-3 rounded-md border border-border bg-background"
                            >
                                <option value="1:100">1:100</option>
                                <option value="1:50">1:50</option>
                                <option value="1:20">1:20</option>
                                <option value="1:10">1:10</option>
                                <option value="1:1">1:1 (Full Scale)</option>
                            </select>
                        </div>
                    )}

                    {/* Info */}
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
                        <strong>Export Info:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>• Nodes: {nodes.length}</li>
                            <li>• Connections: {edges.length}</li>
                            {format === 'png' && <li>• Resolution: {scale}x native size</li>}
                            {format === 'dxf' && <li>• Compatible with AutoCAD 2000+</li>}
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex-1"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};
