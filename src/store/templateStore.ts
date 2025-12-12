import { create } from 'zustand';

export interface Template {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    nodes: any[];
    edges: any[];
    category: 'residential' | 'commercial' | 'industrial' | 'custom';
    createdAt: Date;
}

interface TemplateState {
    templates: Template[];
    addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void;
    removeTemplate: (id: string) => void;
    getTemplate: (id: string) => Template | undefined;
    loadTemplate: (id: string) => { nodes: any[]; edges: any[] } | null;
}

const DEFAULT_TEMPLATES: Template[] = [
    {
        id: 'template-1',
        name: 'Blank Canvas',
        description: 'Start from scratch',
        nodes: [],
        edges: [],
        category: 'custom',
        createdAt: new Date(),
    },
    {
        id: 'template-2',
        name: 'Simple Room',
        description: 'Single room layout',
        nodes: [
            {
                id: 'room-1',
                type: 'room',
                position: { x: 100, y: 100 },
                data: { label: 'Living Room', width: 300, height: 400 },
                style: { width: 300, height: 400 },
            },
        ],
        edges: [],
        category: 'residential',
        createdAt: new Date(),
    },
    {
        id: 'template-3',
        name: '2-Bedroom Apartment',
        description: 'Basic 2BR apartment layout',
        nodes: [
            {
                id: 'room-1',
                type: 'room',
                position: { x: 50, y: 50 },
                data: { label: 'Living Room' },
                style: { width: 350, height: 300 },
            },
            {
                id: 'room-2',
                type: 'room',
                position: { x: 450, y: 50 },
                data: { label: 'Bedroom 1' },
                style: { width: 250, height: 250 },
            },
            {
                id: 'room-3',
                type: 'room',
                position: { x: 450, y: 350 },
                data: { label: 'Bedroom 2' },
                style: { width: 250, height: 250 },
            },
        ],
        edges: [],
        category: 'residential',
        createdAt: new Date(),
    },
];

export const useTemplateStore = create<TemplateState>((set, get) => ({
    templates: DEFAULT_TEMPLATES,

    addTemplate: (template) => {
        const newTemplate: Template = {
            ...template,
            id: `template-${Date.now()}`,
            createdAt: new Date(),
        };
        set({ templates: [...get().templates, newTemplate] });
    },

    removeTemplate: (id) => {
        set({ templates: get().templates.filter(t => t.id !== id) });
    },

    getTemplate: (id) => {
        return get().templates.find(t => t.id === id);
    },

    loadTemplate: (id) => {
        const template = get().getTemplate(id);
        if (!template) return null;
        return {
            nodes: template.nodes,
            edges: template.edges,
        };
    },
}));
