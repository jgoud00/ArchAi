import { Node, Edge } from '@xyflow/react';

/**
 * Export blueprint to SVG format
 */
export const exportToSVG = (nodes: Node[], edges: Edge[], width: number = 2000, height: number = 2000): string => {
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;

    // Draw edges
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
            const sourceX = sourceNode.position.x + ((sourceNode.style?.width as number) || 0) / 2;
            const sourceY = sourceNode.position.y + ((sourceNode.style?.height as number) || 0) / 2;
            const targetX = targetNode.position.x + ((targetNode.style?.width as number) || 0) / 2;
            const targetY = targetNode.position.y + ((targetNode.style?.height as number) || 0) / 2;

            svg += `<line x1="${sourceX}" y1="${sourceY}" x2="${targetX}" y2="${targetY}" stroke="black" stroke-width="2"/>`;
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const x = node.position.x;
        const y = node.position.y;
        const width = (node.style?.width as number) || 100;
        const height = (node.style?.height as number) || 100;

        svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="black" stroke-width="2"/>`;

        // Add label
        if (node.data.label) {
            svg += `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="14">${node.data.label}</text>`;
        }
    });

    svg += '</svg>';
    return svg;
};

/**
 * Export blueprint to PNG using canvas
 */
export const exportToPNG = async (elementId: string, scale: number = 2): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, {
            scale,
            backgroundColor: '#ffffff',
            logging: false,
        });

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob));
        });
    } catch (error) {
        console.error('PNG export failed:', error);
        return null;
    }
};

/**
 * Basic DXF export (simplified format)
 */
export const exportToDXF = (nodes: Node[], edges: Edge[]): string => {
    let dxf = '0\nSECTION\n2\nENTITIES\n';

    // Export nodes as rectangles
    nodes.forEach(node => {
        const x = node.position.x;
        const y = node.position.y;
        const width = (node.style?.width as number) || 100;
        const height = (node.style?.height as number) || 100;

        // DXF LWPOLYLINE for rectangle
        dxf += '0\nLWPOLYLINE\n8\n0\n90\n5\n70\n1\n';
        dxf += `10\n${x}\n20\n${-y}\n`;
        dxf += `10\n${x + width}\n20\n${-y}\n`;
        dxf += `10\n${x + width}\n20\n${-(y + height)}\n`;
        dxf += `10\n${x}\n20\n${-(y + height)}\n`;
        dxf += `10\n${x}\n20\n${-y}\n`;
    });

    // Export edges as lines
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
            const sourceX = sourceNode.position.x + ((sourceNode.style?.width as number) || 0) / 2;
            const sourceY = sourceNode.position.y + ((sourceNode.style?.height as number) || 0) / 2;
            const targetX = targetNode.position.x + ((targetNode.style?.width as number) || 0) / 2;
            const targetY = targetNode.position.y + ((targetNode.style?.height as number) || 0) / 2;

            dxf += '0\nLINE\n8\n0\n';
            dxf += `10\n${sourceX}\n20\n${-sourceY}\n`;
            dxf += `11\n${targetX}\n21\n${-targetY}\n`;
        }
    });

    dxf += '0\nENDSEC\n0\nEOF\n';
    return dxf;
};

/**
 * Download file helper
 */
export const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Generate print-friendly layout
 */
export const generatePrintLayout = (nodes: Node[], scale: string = '1:100'): string => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Blueprint Print Layout</title>
            <style>
                @page { size: A4 landscape; margin: 1cm; }
                body { font-family: Arial, sans-serif; margin: 0; }
                .header { text-align: center; padding: 20px; border-bottom: 2px solid black; }
                .title { font-size: 24px; font-weight: bold; }
                .scale { font-size: 14px; margin-top: 10px; }
                .content { padding: 20px; }
                .footer { text-align: center; padding: 10px; border-top: 1px solid #ccc; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Blueprint Layout</div>
                <div class="scale">Scale: ${scale}</div>
                <div class="scale">Generated: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="content">
                <div id="blueprint-viewer">
                    <!-- Blueprint content will be inserted here -->
                </div>
            </div>
            <div class="footer">
                Page 1 of 1 | Total Nodes: ${nodes.length}
            </div>
        </body>
        </html>
    `;
    return html;
};
