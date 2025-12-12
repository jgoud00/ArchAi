import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, UserPlus, CheckCircle2, Info, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 'alert' | 'activity' | 'info';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
    icon?: React.ReactNode;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Budget Alert',
        message: 'Project "Skyline Tower" exceeded monthly budget by 15%.',
        type: 'alert',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        read: false,
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />
    },
    {
        id: '2',
        title: 'New Team Member',
        message: 'Sarah Lee joined the "Riverfront Park" project.',
        type: 'activity',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        icon: <UserPlus className="h-4 w-4 text-primary" />
    },
    {
        id: '3',
        title: 'Blueprint Updated',
        message: 'New structural drawings uploaded for Sector 4.',
        type: 'activity',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true,
        icon: <FileText className="h-4 w-4 text-purple-500" />
    },
    {
        id: '4',
        title: 'Invoice Paid',
        message: 'Payment received for Invoice #4022.',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        icon: <DollarSign className="h-4 w-4 text-green-500" />
    }
];

export const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const containerRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'alerts') return n.type === 'alert';
        if (activeTab === 'activity') return n.type === 'activity' || n.type === 'info';
        return true;
    });

    const NotificationItem = ({ item }: { item: Notification }) => (
        <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 relative group",
            !item.read && "bg-muted/20"
        )}>
            <div className={cn(
                "mt-1 h-8 w-8 rounded-full flex items-center justify-center bg-background border shadow-sm shrink-0",
                !item.read && "border-primary/20"
            )}>
                {item.icon || <Info className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className={cn("text-sm font-medium leading-none", !item.read && "text-foreground")}>
                        {item.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.message}
                </p>
            </div>
            {!item.read && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
            )}
        </div>
    );

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] z-50 origin-top-right animate-scale-in">
                    <div className="glass rounded-xl border border-white/20 shadow-soft-xl overflow-hidden">
                        <div className="p-4 border-b border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                        {unreadCount} New
                                    </Badge>
                                )}
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full justify-start bg-transparent p-0 h-auto border-b border-border/40 pb-0 space-x-6">
                                    <TabsTrigger
                                        value="all"
                                        className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="alerts"
                                        className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Alerts
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="activity"
                                        className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        Activity
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 bg-background/50">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map(item => (
                                    <NotificationItem key={item.id} item={item} />
                                ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    No notifications in this tab.
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-border/50 bg-muted/30">
                            <Button
                                variant="ghost"
                                className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                            >
                                <CheckCircle2 className="mr-2 h-3 w-3" />
                                Mark all as read
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
