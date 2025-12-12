import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    FolderOpen,
    Calendar,
    Settings,
    Plus
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

/**
 * MobileBottomNav - Bottom navigation bar for mobile screens
 * 
 * Features:
 * - Fixed bottom position
 * - Active state indicator
 * - Floating action button
 * - Safe area padding for notch devices
 * - Only visible on mobile (< 768px)
 */
export const MobileBottomNav = memo(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showFab, setShowFab] = useState(false);

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50",
                    "bg-card/95 backdrop-blur-lg border-t border-border",
                    "flex items-center justify-around",
                    "h-16 pb-safe", // pb-safe for iPhone notch
                    "md:hidden" // Only show on mobile
                )}
                role="navigation"
                aria-label="Mobile navigation"
            >
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full",
                                "transition-colors duration-200",
                                "active:scale-95 touch-manipulation",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <div className={cn(
                                "relative p-1.5 rounded-xl transition-all",
                                isActive && "bg-primary/10"
                            )}>
                                <Icon className={cn(
                                    "h-5 w-5 transition-transform",
                                    isActive && "scale-110"
                                )} />
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] mt-0.5 font-medium",
                                isActive && "text-primary"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}

                {/* Center FAB Trigger */}
                <button
                    onClick={() => setShowFab(!showFab)}
                    className={cn(
                        "absolute -top-6 left-1/2 -translate-x-1/2",
                        "h-14 w-14 rounded-full",
                        "bg-primary text-primary-foreground",
                        "flex items-center justify-center",
                        "shadow-lg shadow-primary/25",
                        "active:scale-95 transition-transform",
                        "touch-manipulation"
                    )}
                    aria-label="Quick actions"
                >
                    <Plus className={cn(
                        "h-6 w-6 transition-transform duration-200",
                        showFab && "rotate-45"
                    )} />
                </button>
            </nav>

            {/* FAB Menu */}
            {showFab && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 md:hidden"
                        onClick={() => setShowFab(false)}
                    />
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden">
                        <div className="flex flex-col gap-3 items-center animate-fade-in">
                            <button
                                onClick={() => { navigate('/projects/new'); setShowFab(false); }}
                                className="bg-card border border-border rounded-full px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-2"
                            >
                                <FolderOpen className="h-4 w-4" />
                                New Project
                            </button>
                            <button
                                onClick={() => { navigate('/calendar/new'); setShowFab(false); }}
                                className="bg-card border border-border rounded-full px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                New Event
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Spacer for content to not be hidden behind nav */}
            <div className="h-16 md:hidden" />
        </>
    );
});

MobileBottomNav.displayName = 'MobileBottomNav';

// ============================================
// MOBILE DRAWER
// ============================================

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    position?: 'left' | 'right' | 'bottom';
    className?: string;
}

/**
 * MobileDrawer - Touch-friendly slide-in drawer
 * 
 * Features:
 * - Swipe to close gesture
 * - Smooth spring animation
 * - Backdrop click to close
 * - Position: left, right, or bottom
 */
export const MobileDrawer = memo(({
    isOpen,
    onClose,
    children,
    position = 'left',
    className,
}: MobileDrawerProps) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const currentXRef = useRef(0);
    const currentYRef = useRef(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        startYRef.current = e.touches[0].clientY;
        currentXRef.current = 0;
        currentYRef.current = 0;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const deltaX = e.touches[0].clientX - startXRef.current;
        const deltaY = e.touches[0].clientY - startYRef.current;
        currentXRef.current = deltaX;
        currentYRef.current = deltaY;

        if (drawerRef.current) {
            if (position === 'left' && deltaX < 0) {
                drawerRef.current.style.transform = `translateX(${deltaX}px)`;
            } else if (position === 'right' && deltaX > 0) {
                drawerRef.current.style.transform = `translateX(${deltaX}px)`;
            } else if (position === 'bottom' && deltaY > 0) {
                drawerRef.current.style.transform = `translateY(${deltaY}px)`;
            }
        }
    }, [position]);

    const handleTouchEnd = useCallback(() => {
        if (!drawerRef.current) return;

        const threshold = 100;
        let shouldClose = false;

        if (position === 'left' && currentXRef.current < -threshold) {
            shouldClose = true;
        } else if (position === 'right' && currentXRef.current > threshold) {
            shouldClose = true;
        } else if (position === 'bottom' && currentYRef.current > threshold) {
            shouldClose = true;
        }

        if (shouldClose) {
            onClose();
        }

        // Reset transform
        drawerRef.current.style.transform = '';
    }, [position, onClose]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const positionClasses = {
        left: 'left-0 top-0 bottom-0 w-80 max-w-[85vw]',
        right: 'right-0 top-0 bottom-0 w-80 max-w-[85vw]',
        bottom: 'left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl',
    };

    const animationClasses = {
        left: 'animate-slide-in-left',
        right: 'animate-slide-in-right',
        bottom: 'animate-slide-in-up',
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={cn(
                    "fixed z-50 bg-card shadow-2xl",
                    positionClasses[position],
                    animationClasses[position],
                    className
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag Handle for bottom drawer */}
                {position === 'bottom' && (
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                    </div>
                )}
                {children}
            </div>
        </>
    );
});

MobileDrawer.displayName = 'MobileDrawer';


