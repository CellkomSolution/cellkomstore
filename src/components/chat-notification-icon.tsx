"use client";

import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUserUnifiedConversation, ChatConversation, ChatMessage } from "@/lib/supabase/chats"; // Import getUserUnifiedConversation
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "./chat-widget";
import { useAdmin } from "@/hooks/use-admin";

export function ChatNotificationIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin } = useAdmin();
  const [unifiedConversation, setUnifiedConversation] = React.useState<ChatConversation | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = React.useState(0);
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [activeChatProductId, setActiveChatProductId] = React.useState<string | null>(null);
  const [activeChatProductName, setActiveChatProductName] = React.useState<string | null>(null);

  const fetchUnifiedConversation = React.useCallback(async () => {
    if (!user || isAdmin) {
      setUnifiedConversation(null);
      setTotalUnreadCount(0);
      setIsLoadingConversations(false);
      return;
    }
    setIsLoadingConversations(true);
    const conversation = await getUserUnifiedConversation(user.id);
    setUnifiedConversation(conversation);
    setTotalUnreadCount(conversation?.unread_count || 0);
    setIsLoadingConversations(false);
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (!isSessionLoading && user && !isAdmin) {
      fetchUnifiedConversation();

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
            fetchUnifiedConversation();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, isAdmin, fetchUnifiedConversation]);

  const handleChatIconClick = () => {
    // When the icon is clicked, always open the unified chat with no specific product context initially
    setActiveChatProductId(null);
    setActiveChatProductName(null);
    setIsChatOpen(true);
  };

  if (isSessionLoading || isLoadingConversations || !user || isAdmin) {
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
        productId={activeChatProductId} // This will be null, but the prop is kept for product page initiation
        productName={activeChatProductName} // This will be null, but the prop is kept for product page initiation
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
}