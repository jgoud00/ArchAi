import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    LayoutDashboard,
    Calendar,
    FileText,
    BookOpen,
    Settings,
    Clock,
    ArrowRight,
    Command
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CommandItem {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    category: 'navigation' | 'recent' | 'action';
    keywords?: string[];
}

const defaultCommands: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, category: 'navigation', keywords: ['home', 'main'] },
    { id: 'calendar', label: 'Calendar', path: '/calendar', icon: <Calendar className="h-4 w-4" />, category: 'navigation', keywords: ['schedule', 'events'] },
    { id: 'templates', label: 'Templates', path: '/templates', icon: <FileText className="h-4 w-4" />, category: 'navigation', keywords: ['blueprints', 'presets'] },
    { id: 'documentation', label: 'Documentation', path: '/documentation', icon: <BookOpen className="h-4 w-4" />, category: 'navigation', keywords: ['docs', 'help', 'guide'] },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" />, category: 'navigation', keywords: ['preferences', 'config'] },
];

const RECENT_PAGES_KEY = 'archai-recent-pages';
const MAX_RECENT_PAGES = 5;

interface RecentPage {
    path: string;
    label: string;
    timestamp: number;
}

// Get recent pages from localStorage
const getRecentPages = (): RecentPage[] => {
    try {
        const stored = localStorage.getItem(RECENT_PAGES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save recent page to localStorage
const saveRecentPage = (path: string, label: string) => {
    try {
        const recent = getRecentPages().filter(p => p.path !== path);
        recent.unshift({ path, label, timestamp: Date.now() });
        localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_PAGES)));
    } catch {
        // Ignore storage errors
    }
};

/**
 * CommandPalette - Global search and navigation modal
 * 
 * Open with Cmd/Ctrl+K
 */
export const CommandPalette = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Load recent pages on mount
    useEffect(() => {
        setRecentPages(getRecentPages());
    }, [isOpen]);

    // Track page visits
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            const label = pathSegments[pathSegments.length - 1]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            saveRecentPage(location.pathname, label);
        }
    }, [location.pathname]);

    // Build command list including recent pages
    const commands: CommandItem[] = [
        ...recentPages.slice(0, 3).map(page => ({
            id: `recent-${page.path}`,
            label: page.label,
            path: page.path,
            icon: <Clock className="h-4 w-4" />,
            category: 'recent' as const,
        })),
        ...defaultCommands,
    ];

    // Filter commands based on query
    const filteredCommands = query.trim()
        ? commands.filter(cmd => {
            const searchText = query.toLowerCase();
            return (
                cmd.label.toLowerCase().includes(searchText) ||
                cmd.path.toLowerCase().includes(searchText) ||
                cmd.keywords?.some(k => k.includes(searchText))
            );
        })
        : commands;

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    navigate(filteredCommands[selectedIndex].path);
                    setIsOpen(false);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    }, [filteredCommands, selectedIndex, navigate]);

    const handleSelect = useCallback((path: string) => {
        navigate(path);
        setIsOpen(false);
    }, [navigate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search or jump to..."
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                        aria-label="Search commands"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded">
                        <Command className="h-3 w-3" />K
                    </kbd>
                </div>

                {/* Commands List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No results found
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => handleSelect(cmd.path)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                        index === selectedIndex
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-muted"
                                    )}
                                >
                                    <span className="text-muted-foreground">{cmd.icon}</span>
                                    <span className="flex-1">{cmd.label}</span>
                                    {cmd.category === 'recent' && (
                                        <span className="text-xs text-muted-foreground">Recent</span>
                                    )}
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded">esc</kbd> close
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

CommandPalette.displayName = 'CommandPalette';

/**
 * RecentPagesDropdown - Dropdown showing recently visited pages
 */
export const RecentPagesDropdown = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRecentPages(getRecentPages());
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    if (recentPages.length === 0) return null;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Recent pages"
                aria-expanded={isOpen}
            >
                <Clock className="h-4 w-4" />
                <span className="hidden md:inline">Recent</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-border">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Recently Visited
                        </span>
                    </div>
                    <div className="py-1">
                        {recentPages.map((page, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(page.path)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                            >
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="truncate">{page.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

RecentPagesDropdown.displayName = 'RecentPagesDropdown';
