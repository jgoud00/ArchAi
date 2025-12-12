/**
 * Expanded Design Tokens - Complete Design System
 * Part 2: Visual System & Design Consistency
 */

// ============================================================================
// COLORS - Semantic Color System
// ============================================================================

export const colors = {
    // Primary brand colors (already in CSS vars)
    primary: 'hsl(var(--primary))',
    'primary-foreground': 'hsl(var(--primary-foreground))',

    secondary: 'hsl(var(--secondary))',
    'secondary-foreground': 'hsl(var(--secondary-foreground))',

    // Semantic colors for states
    success: {
        DEFAULT: 'hsl(142, 76%, 36%)',      // Green
        foreground: 'hsl(142, 76%, 96%)',
        muted: 'hsl(142, 76%, 90%)',
    },

    warning: {
        DEFAULT: 'hsl(38, 92%, 50%)',       // Orange
        foreground: 'hsl(38, 92%, 96%)',
        muted: 'hsl(38, 92%, 90%)',
    },

    info: {
        DEFAULT: 'hsl(199, 89%, 48%)',      // Blue
        foreground: 'hsl(199, 89%, 96%)',
        muted: 'hsl(199, 89%, 90%)',
    },

    error: 'hsl(var(--destructive))',
    'error-foreground': 'hsl(var(--destructive-foreground))',
} as const;

// ============================================================================
// SPACING - Consistent Spacing Scale
// ============================================================================

export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
    // Font sizes
    fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
    },

    // Font weights
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    // Line heights
    lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
    },

    // Letter spacing
    letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
    },
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const layout = {
    // Standard page padding (responsive)
    pagePadding: 'p-4 md:p-6 lg:p-8',

    // Section spacing
    sectionSpacing: 'space-y-6 md:space-y-8',

    // Card padding
    cardPadding: 'p-6',

    // Modal padding
    modalPadding: 'p-6',

    // Grid gaps
    gridGap: {
        sm: 'gap-3',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
    },

    // Max widths
    maxWidth: {
        sm: 'max-w-sm',       // 384px
        md: 'max-w-md',       // 448px
        lg: 'max-w-lg',       // 512px
        xl: 'max-w-xl',       // 576px
        '2xl': 'max-w-2xl',   // 672px
        '3xl': 'max-w-3xl',   // 768px
        '4xl': 'max-w-4xl',   // 896px
        '5xl': 'max-w-5xl',   // 1024px
        '6xl': 'max-w-6xl',   // 1152px
        '7xl': 'max-w-7xl',   // 1280px
    },
} as const;

// ============================================================================
// BORDERS
// ============================================================================

export const borderRadius = {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================================================
// STATES - Interaction States
// ============================================================================

export const states = {
    hover: 'hover:bg-accent/10 hover:text-accent-foreground transition-colors',
    active: 'active:scale-95 transition-transform',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    loading: 'opacity-70 cursor-wait pointer-events-none',
} as const;

// ============================================================================
// TEXT STYLES
// ============================================================================

export const textStyles = {
    // Page titles
    h1: 'text-4xl font-bold tracking-tight',

    // Section titles
    h2: 'text-2xl font-semibold',

    // Subsection titles
    h3: 'text-xl font-medium',

    // Card titles
    h4: 'text-lg font-medium',

    // Body text
    body: 'text-base',

    // Small text
    small: 'text-sm text-muted-foreground',

    // Tiny text
    xs: 'text-xs text-muted-foreground',

    // Links
    link: 'text-primary underline-offset-4 hover:underline',

    // Labels
    label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
} as const;

// ============================================================================
// CARD STYLES
// ============================================================================

export const cardStyles = {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    interactive: 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200',
    glass: 'glass border border-border rounded-lg',
    glassDark: 'glass-dark border border-border rounded-lg',
    elevated: 'rounded-lg border bg-card text-card-foreground shadow-lg',
} as const;

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttonStyles = {
    sizes: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
        icon: 'h-9 w-9',
    },

    base: 'inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
} as const;

// ============================================================================
// FORM STYLES
// ============================================================================

export const formStyles = {
    label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',

    input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',

    textarea: 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',

    select: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',

    error: 'text-sm text-destructive',

    fieldWrapper: 'space-y-2',

    helper: 'text-xs text-muted-foreground',
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
    // Duration
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },

    // Easing
    easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Common animations
    fadeIn: 'animate-fade-in',
    fadeOut: 'animate-fade-out',
    slideIn: 'animate-slide-in',
    slideOut: 'animate-slide-out',
    spin: 'animate-spin',
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

export const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-10 w-10',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
} as const;
