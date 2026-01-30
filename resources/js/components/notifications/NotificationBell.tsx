import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck, Gift, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { router } from '@inertiajs/react';

type NotificationType = 'info' | 'success' | 'warning' | 'birthday';

interface Notification {
    id: number;
    title: string;
    message: string | null;
    type: NotificationType;
    link: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationBellProps {
    className?: string;
    pollInterval?: number; // in milliseconds
}

export function NotificationBell({ className, pollInterval = 60000 }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await axios.get('/notifications/unread-count');
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();

        // Poll for updates periodically
        const interval = setInterval(() => {
            if (!isOpen) {
                fetchUnreadCount();
            }
        }, pollInterval);

        // Listen for Inertia page visits to refresh notifications
        const removeFinishListener = router.on('finish', () => {
            fetchNotifications();
        });

        return () => {
            clearInterval(interval);
            removeFinishListener();
        };
    }, [fetchNotifications, fetchUnreadCount, pollInterval, isOpen]);

    // Refresh notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const markAsRead = async (notification: Notification) => {
        if (notification.read_at) return;

        try {
            await axios.post(`/notifications/${notification.id}/read`);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotification = async (e: React.MouseEvent, notification: Notification) => {
        e.stopPropagation();
        try {
            await axios.delete(`/notifications/${notification.id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
            if (!notification.read_at) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification);
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'birthday':
                return <Gift className="h-4 w-4 text-pink-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning':
                return <Info className="h-4 w-4 text-yellow-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative', className)}
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs"
                            onClick={markAllAsRead}
                            disabled={isLoading}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    'group flex cursor-pointer flex-col items-start gap-1 p-3',
                                    !notification.read_at && 'bg-muted/50'
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex w-full items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex flex-col gap-0.5">
                                            <span className={cn(
                                                'text-sm',
                                                !notification.read_at && 'font-semibold'
                                            )}>
                                                {notification.title}
                                            </span>
                                            {notification.message && (
                                                <span className="text-xs text-muted-foreground">
                                                    {notification.message}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!notification.read_at && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                                            onClick={(e) => deleteNotification(e, notification)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationBell;
