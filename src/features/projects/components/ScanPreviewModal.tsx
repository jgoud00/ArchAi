import { memo } from 'react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface Scan {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video';
    uploadedAt: Date;
}

interface ScanPreviewModalProps {
    scan: Scan | null;
    onClose: () => void;
}

/**
 * ScanPreviewModal - Modal for previewing scans
 */
export const ScanPreviewModal = memo(({ scan, onClose }: ScanPreviewModalProps) => {
    if (!scan) return null;

    return (
        <Modal
            isOpen={!!scan}
            onClose={onClose}
            title={scan.name}
            className="max-w-4xl"
        >
            <div className="space-y-4">
                {scan.type === 'image' ? (
                    <img src={scan.url} alt={scan.name} className="w-full rounded-lg" />
                ) : (
                    <video src={scan.url} controls className="w-full rounded-lg" />
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Uploaded {format(scan.uploadedAt, 'MMM dd, yyyy')}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(scan.url, '_blank')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>
        </Modal>
    );
});

ScanPreviewModal.displayName = 'ScanPreviewModal';
