"use client";

import * as React from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUnreadNotificationsCount } from "@/lib/supabase/notifications";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/use-admin";
import { NotificationSheet } from "./notification-sheet"; // Import NotificationSheet
import { ChatWidget } from "./chat-widget"; // Import ChatWidget
import { getProductById } from "@/lib/supabase/products"; // Import getProductById
import { getOrderById } from "@/lib/supabase/orders"; // Import getOrderById

export function NotificationBellIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoadingCount, setIsLoadingCount] = React.useState(true);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false); // State to control the sheet
  
  // State for ChatWidget context
  const [isChatWidgetOpen, setIsChatWidgetOpen] = React.useState(false);
  const [chatProductId, setChatProductId] = React.useState<string | null>(null);
  const [chatProductName, setChatProductName] = React.useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = React.useState<string | null>(null);
  const [chatOrderName, setChatOrderName] = React.useState<string | null>(null);

  const router = useRouter();

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user || isAdmin) { // Only for regular users
      setUnreadCount(0);
      setIsLoadingCount(false);
      return;
    }
    setIsLoadingCount(true);
    const count = await getUnreadNotificationsCount(user.id);
    setUnreadCount(count);
    setIsLoadingCount(false);
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (!isSessionLoading && !isAdminLoading && user && !isAdmin) {
      fetchUnreadCount();

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
            // Refetch count on any relevant change
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, isAdminLoading, user, isAdmin, fetchUnreadCount]);

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

  if (isSessionLoading || isLoadingCount || !user || isAdmin) {
    return null; // Only render for logged-in regular users
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsSheetOpen(true)} // Open the sheet on click
        disabled={isLoadingCount}
      >
        {isLoadingCount ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </>
        )}
        <span className="sr-only">Notifikasi</span>
      </Button>
      <NotificationSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onOpenChatWidget={handleOpenChatWidget} // Pass handler to open chat widget
      />
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