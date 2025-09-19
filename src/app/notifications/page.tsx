"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from "@/lib/supabase/notifications";
import { useSession } from "@/context/session-context";
import { NotificationListContent } from "@/components/notification-list-content"; // Import the new content component
import { Card, CardContent } from "@/components/ui/card"; // Import Card

export default function NotificationsPage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Gagal menandai notifikasi sebagai sudah dibaca.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setIsLoading(true); // Show loading state while marking all as read
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi telah ditandai sebagai sudah dibaca.");
    } catch (error: any) {
      toast.error("Gagal menandai semua notifikasi sebagai sudah dibaca: " + error.message);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="shadow-none">
        <CardContent className="p-0">
          <NotificationListContent
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onMarkAsRead={handleMarkAsRead}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}