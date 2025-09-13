"use client";

import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUnreadMessageCount } from "@/lib/supabase/chats"; // Hanya import getUnreadMessageCount
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "./chat-widget";
import { useAdmin } from "@/hooks/use-admin";

export function ChatNotificationIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin } = useAdmin();
  const [totalUnreadCount, setTotalUnreadCount] = React.useState(0);
  const [isLoadingCount, setIsLoadingCount] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  // activeChatProductId dan activeChatProductName tidak lagi diperlukan di sini
  // karena ChatWidget yang dibuka dari ikon ini adalah chat umum, bukan chat produk spesifik.

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user || isAdmin) {
      setTotalUnreadCount(0);
      setIsLoadingCount(false);
      return;
    }
    setIsLoadingCount(true);
    const count = await getUnreadMessageCount(user.id);
    setTotalUnreadCount(count);
    setIsLoadingCount(false);
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (!isSessionLoading && user && !isAdmin) {
      fetchUnreadCount();

      // Subscribe to all messages where this user is the receiver
      const channel = supabase
        .channel(`user_unified_messages_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for INSERT and UPDATE
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            // If a new message is received or an existing one is marked read, refetch
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, isAdmin, fetchUnreadCount]);

  const handleChatIconClick = () => {
    // When the icon is clicked, always open the unified chat with no specific product context initially
    setIsChatOpen(true);
  };

  if (isSessionLoading || isLoadingCount || !user || isAdmin) {
    return null; // Don't render if loading, not logged in, or is admin
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleChatIconClick}
      >
        <MessageSquare className="h-6 w-6" />
        {totalUnreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {totalUnreadCount}
          </Badge>
        )}
        <span className="sr-only">Chat</span>
      </Button>
      <ChatWidget
        productId={null} // Chat umum, tidak terkait produk spesifik
        productName={null} // Chat umum, tidak terkait produk spesifik
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
}