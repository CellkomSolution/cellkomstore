"use client";

import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUnreadMessageCount } from "@/lib/supabase/chats";
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "./chat-widget";
import { useAdmin } from "@/hooks/use-admin";

export function ChatNotificationIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin } = useAdmin();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoadingCount, setIsLoadingCount] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user || isAdmin) { // Admins don't use this widget for their own unread count
      setUnreadCount(0);
      setIsLoadingCount(false);
      return;
    }
    setIsLoadingCount(true);
    const count = await getUnreadMessageCount(user.id);
    setUnreadCount(count);
    setIsLoadingCount(false);
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (!isSessionLoading && user && !isAdmin) {
      fetchUnreadCount();

      const channel = supabase
        .channel(`unread_messages_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            // Only increment if the message is not from the current user and is unread
            if (payload.new.sender_id !== user.id && !payload.new.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
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
            // If a message was unread and is now read, decrement count
            if (payload.old.is_read === false && payload.new.is_read === true) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, isAdmin, fetchUnreadCount]);

  if (isSessionLoading || isLoadingCount || !user || isAdmin) {
    return null; // Don't render if loading, not logged in, or is admin
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
        <span className="sr-only">Chat</span>
      </Button>
      <ChatWidget
        productId={null}
        productName={null}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
}