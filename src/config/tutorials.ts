/**
 * Tutorial configurations for different workflows
 */

// Dashboard Tutorial Steps
export const dashboardTutorialSteps = [
    {
        id: 'welcome',
        targetSelector: '[data-tutorial="dashboard-header"]',
        title: 'Welcome to ArchAI! 👋',
        description: 'This is your dashboard - the central hub for all your architecture projects. Let\'s take a quick tour!',
        position: 'bottom' as const,
    },
    {
        id: 'kpi-cards',
        targetSelector: '[data-tutorial="kpi-cards"]',
        title: 'Quick Stats',
        description: 'Keep track of your projects, active tasks, and team activity at a glance with these KPI cards.',
        position: 'bottom' as const,
    },
    {
        id: 'recent-projects',
        targetSelector: '[data-tutorial="recent-projects"]',
        title: 'Your Projects',
        description: 'Access your recent projects quickly. Click any project to open the blueprint editor.',
        position: 'right' as const,
    },
    {
        id: 'quick-actions',
        targetSelector: '[data-tutorial="quick-actions"]',
        title: 'Quick Actions',
        description: 'Drag to reorder these shortcuts. They provide fast access to common tasks.',
        position: 'left' as const,
    },
    {
        id: 'sidebar',
        targetSelector: '[data-tutorial="sidebar"]',
        title: 'Navigation',
        description: 'Use the sidebar to navigate between different sections. You can collapse it for more workspace.',
        position: 'right' as const,
    },
];

// Blueprint Editor Tutorial Steps
export const blueprintTutorialSteps = [
    {
        id: 'toolbar',
        targetSelector: '[data-tutorial="drawing-toolbar"]',
        title: 'Drawing Tools',
        description: 'Select tools to draw walls, doors, windows, and shapes. Notice the keyboard shortcuts on each tool!',
        position: 'bottom' as const,
    },
    {
        id: 'canvas',
        targetSelector: '[data-tutorial="canvas"]',
        title: 'Design Canvas',
        description: 'This is your design canvas. Drag elements from the sidebar, zoom with scroll, and pan by dragging.',
        position: 'left' as const,
    },
    {
        id: 'layers',
        targetSelector: '[data-tutorial="layers-panel"]',
        title: 'Layers & Properties',
        description: 'Organize your design with layers. Select elements to see their properties here.',
        position: 'left' as const,
    },
    {
        id: 'zoom',
        targetSelector: '[data-tutorial="zoom-controls"]',
        title: 'Zoom Controls',
        description: 'Control your view with zoom in/out, presets, or fit-to-view. Use scroll wheel for quick zooming.',
        position: 'top' as const,
    },
    {
        id: 'minimap',
        targetSelector: '[data-tutorial="minimap"]',
        title: 'Minimap',
        description: 'Get an overview of your entire design. Click anywhere to navigate instantly.',
        position: 'left' as const,
    },
];

// Projects Page Tutorial Steps
export const projectsTutorialSteps = [
    {
        id: 'create-project',
        targetSelector: '[data-tutorial="create-project-btn"]',
        title: 'Create Your First Project',
        description: 'Click here to start a new architecture project. You can choose from templates or start from scratch.',
        position: 'bottom' as const,
    },
    {
        id: 'project-filters',
        targetSelector: '[data-tutorial="project-filters"]',
        title: 'Filter & Search',
        description: 'Use filters to find projects by status, date, or team. The search bar helps you find specific projects quickly.',
        position: 'bottom' as const,
    },
];

// Calendar Tutorial Steps
export const calendarTutorialSteps = [
    {
        id: 'calendar-view',
        targetSelector: '[data-tutorial="calendar"]',
        title: 'Your Schedule',
        description: 'View all your project deadlines, meetings, and milestones. Click any date to add events.',
        position: 'right' as const,
    },
    {
        id: 'add-event',
        targetSelector: '[data-tutorial="add-event-btn"]',
        title: 'Add Events',
        description: 'Create new events, set reminders, and invite team members to meetings.',
        position: 'bottom' as const,
    },
];
