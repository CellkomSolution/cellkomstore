"use client";

import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUnreadMessageCount } from "@/lib/supabase/chats";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/use-admin";

export function AdminChatNotificationIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoadingCount, setIsLoadingCount] = React.useState(true);
  const router = useRouter();

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user || !isAdmin) {
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
    if (!isSessionLoading && !isAdminLoading && user && isAdmin) {
      fetchUnreadCount();

      const channel = supabase
        .channel(`admin_unread_messages_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for INSERT and UPDATE (for is_read changes)
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${user.id}`,
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

  if (isSessionLoading || isAdminLoading || !user || !isAdmin) {
    return null; // Only render for logged-in admins
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => router.push("/admin/chats")}
      disabled={isLoadingCount}
    >
      {isLoadingCount ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </>
      )}
      <span className="sr-only">Chat Admin</span>
    </Button>
  );
}