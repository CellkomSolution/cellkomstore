"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { Notification as SupabaseNotification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/supabase/notifications";
import { NotificationListContent } from "@/components/notification-list-content";
import { ChatWidget } from "@/components/chat-widget";
import { getProductById } from "@/lib/supabase/products";
import { getOrderById } from "@/lib/supabase/orders";

export default function UserNotificationsPage() {
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  const [notifications, setNotifications] = React.useState<SupabaseNotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // State for ChatWidget context
  const [isChatWidgetOpen, setIsChatWidgetOpen] = React.useState(false);
  const [chatProductId, setChatProductId] = React.useState<string | null>(null);
  const [chatProductName, setChatProductName] = React.useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = React.useState<string | null>(null);
  const [chatOrderName, setChatOrderName] = React.useState<string | null>(null);

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    if (!user || isSessionLoading) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    const fetchedNotifications = await getNotifications(user.id, true); // Fetch all, including read
    setNotifications(fetchedNotifications);
    setIsLoading(false);
  }, [user, isSessionLoading]);

  React.useEffect(() => {
    if (!isSessionLoading && !user) {
      toast.error("Anda harus login untuk melihat notifikasi Anda.");
      router.replace("/auth");
      return;
    }
    fetchNotifications();
  }, [user, isSessionLoading, router, fetchNotifications]);

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

  const handleOpenChatWidget = React.useCallback(async (productId: string | null, orderId: string | null) => {
    setChatProductId(productId);
    setChatOrderId(orderId);
    setChatProductName(null); // Reset product name
    setChatOrderName(null); // Reset order name

    if (productId) {
      const product = await getProductById(productId);
      if (product) setChatProductName(product.name);
    }
    if (orderId) {
      const order = await getOrderById(orderId);
      if (order) setChatOrderName(`Pesanan #${order.id.substring(0, 8)}`);
    }

    setIsChatWidgetOpen(true);
  }, []);

  if (isSessionLoading || isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Memuat notifikasi Anda...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifikasi Anda
          </h1>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semua Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <NotificationListContent
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onMarkAsRead={handleMarkAsRead}
              isLoading={isLoading}
              onOpenChatWidget={handleOpenChatWidget}
            />
          </CardContent>
        </Card>
      </div>
      <ChatWidget
        productId={chatProductId}
        productName={chatProductName}
        orderId={chatOrderId}
        orderName={chatOrderName}
        open={isChatWidgetOpen}
        onOpenChange={setIsChatWidgetOpen}
      />
    </>
  );
}