"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Loader2, CheckCircle2, MailOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/context/session-context";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from "@/lib/supabase/notifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationListContentProps {
  onNotificationClick?: () => void; // Callback to close sheet/drawer
}

export function NotificationListContent({ onNotificationClick }: NotificationListContentProps) {
  const { user, isLoading: isSessionLoading } = useSession();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedNotifications = await getNotifications(user.id);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Gagal memuat notifikasi.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!isSessionLoading && user) {
      fetchNotifications();

      const channel = supabase
        .channel(`user_notifications_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for INSERT and UPDATE
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            fetchNotifications();
            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as Notification;
              toast.info(newNotif.title, {
                description: newNotif.message,
                icon: <Bell className="h-4 w-4" />,
                action: newNotif.link ? {
                  label: "Lihat",
                  onClick: () => {
                    window.location.href = newNotif.link!;
                    onNotificationClick?.();
                  },
                } : undefined,
                duration: 5000,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, fetchNotifications, onNotificationClick]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Gagal menandai notifikasi sebagai sudah dibaca.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setIsMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      toast.success("Semua notifikasi telah ditandai sebagai sudah dibaca.");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Gagal menandai semua notifikasi sebagai sudah dibaca.");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Bell className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Masuk untuk melihat notifikasi Anda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAllRead || notifications.every(n => n.is_read)}
        >
          {isMarkingAllRead ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MailOpen className="mr-2 h-4 w-4" />
          )}
          Tandai Semua Dibaca
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <p>Tidak ada notifikasi baru.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors",
                  !notif.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {!notif.is_read ? (
                    <Bell className="h-5 w-5 text-primary" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium", !notif.is_read && "text-primary")}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="text-xs text-primary hover:underline mt-1 block"
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        onNotificationClick?.(); // Close sheet/drawer
                      }}
                    >
                      Lihat Detail &rarr;
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                  </p>
                </div>
                {!notif.is_read && !notif.link && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <MailOpen className="h-4 w-4" />
                    <span className="sr-only">Tandai sudah dibaca</span>
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}