"use client";

import * as React from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { getUnreadNotificationCount } from "@/lib/supabase/notifications";
import { supabase } from "@/integrations/supabase/client";
import { NotificationSheet } from "./notification-sheet";

export function NotificationBellIcon() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoadingCount, setIsLoadingCount] = React.useState(true);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setIsLoadingCount(false);
      return;
    }
    setIsLoadingCount(true);
    const count = await getUnreadNotificationCount(user.id);
    setUnreadCount(count);
    setIsLoadingCount(false);
  }, [user]);

  React.useEffect(() => {
    if (!isSessionLoading && user) {
      fetchUnreadCount();

      const channel = supabase
        .channel(`user_notifications_count_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for INSERT and UPDATE
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, fetchUnreadCount]);

  if (isSessionLoading || !user) {
    return null; // Don't render if loading or not logged in
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsSheetOpen(true)}
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
      <NotificationSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}