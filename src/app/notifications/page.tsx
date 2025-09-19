"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Bell, CheckCircle, Package, ReceiptText, MessageSquare, Tag } from "lucide-react";
import { toast } from "sonner";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from "@/lib/supabase/notifications";
import { useSession } from "@/context/session-context";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NotificationsPage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    if (!user && !isSessionLoading) {
      toast.error("Anda harus login untuk melihat notifikasi Anda.");
      router.replace("/auth");
      return;
    }
    if (user) {
      const fetchedNotifications = await getNotifications(user.id, true); // Fetch all, including read
      setNotifications(fetchedNotifications);
    }
    setIsLoading(false);
  }, [user, isSessionLoading, router]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setIsMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi telah ditandai sebagai sudah dibaca.");
    } catch (error: any) {
      toast.error("Gagal menandai semua notifikasi sebagai sudah dibaca: " + error.message);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_status_update':
      case 'payment_status_update':
        return <Package className="h-5 w-5 text-primary" />;
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'promotion':
        return <Tag className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Memuat notifikasi Anda...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifikasi Anda</h1>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={isMarkingAllRead} variant="outline">
            {isMarkingAllRead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Bell className="h-24 w-24 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">Tidak ada notifikasi.</h2>
            <p className="text-muted-foreground">
              Semua pembaruan akan muncul di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pr-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.is_read ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className={`text-base ${!notification.is_read ? "font-semibold" : "font-medium"}`}>
                      {notification.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {notification.message}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}