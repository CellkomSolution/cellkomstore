"use client";

import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUserConversations, ChatConversation, ChatMessage } from "@/lib/supabase/chats"; // Import ChatConversation
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "./chat-widget";
import { useAdmin } from "@/hooks/use-admin";

export function ChatNotificationIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin } = useAdmin();
  const [unreadConversations, setUnreadConversations] = React.useState<ChatConversation[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = React.useState(0);
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [activeChatProductId, setActiveChatProductId] = React.useState<string | null>(null);
  const [activeChatProductName, setActiveChatProductName] = React.useState<string | null>(null);

  const fetchConversations = React.useCallback(async () => {
    if (!user || isAdmin) {
      setUnreadConversations([]);
      setTotalUnreadCount(0);
      setIsLoadingConversations(false);
      return;
    }
    setIsLoadingConversations(true);
    const conversations = await getUserConversations(user.id);
    const unread = conversations.filter(conv => conv.unread_count > 0);
    setUnreadConversations(unread);
    setTotalUnreadCount(unread.reduce((sum, conv) => sum + conv.unread_count, 0));
    setIsLoadingConversations(false);
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (!isSessionLoading && user && !isAdmin) {
      fetchConversations();

      const channel = supabase
        .channel(`user_unread_messages_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            // If a new message is received by this user, refetch conversations
            fetchConversations();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            // If a message was unread and is now read, refetch conversations
            if (payload.old.is_read === false && payload.new.is_read === true) {
              fetchConversations();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, isAdmin, fetchConversations]);

  const handleChatIconClick = () => {
    if (totalUnreadCount > 0 && unreadConversations.length > 0) {
      // Open the chat for the most recent unread conversation
      const mostRecentUnread = unreadConversations[0]; // Assuming sorted by last_message_time descending
      setActiveChatProductId(mostRecentUnread.product_id);
      setActiveChatProductName(mostRecentUnread.product_name);
    } else {
      // Open a general chat
      setActiveChatProductId(null);
      setActiveChatProductName(null);
    }
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
        productId={activeChatProductId}
        productName={activeChatProductName}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
}