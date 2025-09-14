"use client";

import * as React from "react";
import { getChatParticipants, ChatConversation } from "@/lib/supabase/chats";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AdminChatList() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname();
  
  const adminId = user?.id;

  const fetchConversations = React.useCallback(async () => {
    if (!adminId) return;
    setIsLoading(true);
    try {
      const fetchedConversations = await getChatParticipants(adminId);
      // Sort conversations to show those with unread messages first, then by latest timestamp
      fetchedConversations.sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
        return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
      });
      setConversations(fetchedConversations);
    } catch (error) {
      console.error("Error in fetchConversations for AdminChatList:", error);
      toast.error("Gagal memuat percakapan chat.");
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [adminId]);

  React.useEffect(() => {
    if (!isSessionLoading && adminId) {
      fetchConversations();

      const channel = supabase
        .channel(`admin_conversations_${adminId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chats",
            filter: `or(receiver_id=eq.${adminId},sender_id=eq.${adminId})`,
          },
          (payload) => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, adminId, fetchConversations]);

  if (isSessionLoading || isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <p className="text-muted-foreground">
          Anda harus login sebagai admin untuk melihat percakapan chat.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada percakapan.
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chats/${conv.id}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                pathname.includes(conv.id)
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              )}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={conv.avatar_url || undefined} />
                <AvatarFallback>
                  {conv.first_name ? conv.first_name[0].toUpperCase() : (conv.email ? conv.email[0].toUpperCase() : <UserIcon className="h-6 w-6" />)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-semibold truncate">
                    {conv.first_name || conv.email || "Pengguna"}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conv.latestTimestamp), { locale: id })}
                  </p>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.latestMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </ScrollArea>
  );
}