import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDateTime } from '../lib/utils';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await notificationsAPI.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (notificationId) => {
        try {
            await notificationsAPI.markRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            toast.error('Error al marcar como leída');
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6" data-testid="notifications-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl">Notificaciones</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 
                            ? `Tienes ${unreadCount} notificaciones sin leer`
                            : 'Todas las notificaciones leídas'}
                    </p>
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Bell className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg">No hay notificaciones</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card 
                            key={notification.id} 
                            className={`card-hover ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}
                            data-testid={`notification-${notification.id}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            notification.read ? 'bg-muted' : 'bg-primary/20'
                                        }`}>
                                            <Bell className={`w-5 h-5 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDateTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkRead(notification.id)}
                                            data-testid={`mark-read-${notification.id}`}
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                    )}
                                    {notification.read && (
                                        <CheckCheck className="w-5 h-5 text-muted-foreground shrink-0" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
