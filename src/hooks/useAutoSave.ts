import { useEffect, useRef } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { useAutoSaveStore } from '@/store/autoSaveStore';

/**
 * useAutoSave - Automatically save blueprint at regular intervals
 * Monitors blueprint changes and saves to localStorage/Supabase
 */
export const useAutoSave = (blueprintId?: string) => {
    const { nodes, edges } = useBlueprintStore();
    const {
        isDirty,
        autoSaveInterval,
        markClean,
        setLastSaved,
        setIsSaving,
        markDirty
    } = useAutoSaveStore();

    const previousNodesRef = useRef(nodes);
    const previousEdgesRef = useRef(edges);

    // Mark dirty when nodes or edges change
    useEffect(() => {
        if (
            JSON.stringify(nodes) !== JSON.stringify(previousNodesRef.current) ||
            JSON.stringify(edges) !== JSON.stringify(previousEdgesRef.current)
        ) {
            markDirty();
            previousNodesRef.current = nodes;
            previousEdgesRef.current = edges;
        }
    }, [nodes, edges, markDirty]);

    // Auto-save interval
    useEffect(() => {
        if (!isDirty) return;

        const saveBlueprintData = async () => {
            try {
                setIsSaving(true);

                const blueprintData = {
                    nodes,
                    edges,
                    timestamp: new Date().toISOString(),
                    blueprintId: blueprintId || 'draft',
                };

                // Save to localStorage as backup
                localStorage.setItem(
                    `blueprint_draft_${blueprintId || 'default'}`,
                    JSON.stringify(blueprintData)
                );

                // TODO: Save to Supabase if blueprintId exists
                // if (blueprintId) {
                //     await saveBlueprintToSupabase(blueprintId, blueprintData);
                // }

                setLastSaved(new Date());
                markClean();
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        };

        const intervalId = setInterval(saveBlueprintData, autoSaveInterval);

        return () => clearInterval(intervalId);
    }, [isDirty, nodes, edges, blueprintId, autoSaveInterval, setIsSaving, setLastSaved, markClean]);

    // Save on page unload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
};
