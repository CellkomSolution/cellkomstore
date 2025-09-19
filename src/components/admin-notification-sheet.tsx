"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Bell, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationListContent } from "./notification-list-content";
import { Notification as SupabaseNotification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/supabase/notifications";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/use-admin";

interface AdminNotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminNotificationSheet({ open, onOpenChange }: AdminNotificationSheetProps) {
  const isMobile = useIsMobile();
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();

  const [notifications, setNotifications] = React.useState<SupabaseNotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    if (!user || isSessionLoading || !isAdmin) { // Only for logged-in admins
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    const fetchedNotifications = await getNotifications(user.id, true); // Fetch all, including read
    setNotifications(fetchedNotifications);
    setIsLoading(false);
  }, [user, isSessionLoading, isAdmin]);

  React.useEffect(() => {
    if (open) { // Only fetch when the sheet/drawer is open
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

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

  const Content = (
    <>
      <SheetHeader className="px-6 pb-4 border-b">
        <SheetTitle className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifikasi Admin
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <NotificationListContent
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          onMarkAsRead={handleMarkAsRead}
          isLoading={isLoading}
          onCloseSheet={() => onOpenChange(false)} // Pass close handler
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] flex flex-col">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-md p-0">
        {Content}
      </SheetContent>
    </Sheet>
  );
}