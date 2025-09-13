"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getChatConversations, ChatConversation, ChatMessage } from "@/lib/supabase/chats";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePathname } from "next/navigation"; // Import usePathname
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

export default function AdminChatsPage() { // Changed to default export
  const { user, isLoading: isSessionLoading } = useSession();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname(); // Get current pathname
  
  const adminId = user?.id;

  const fetchConversations = React.useCallback(async () => {
    if (!adminId) return;
    setIsLoading(true);
    try {
      const fetchedConversations = await getChatConversations(adminId);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error("Error in fetchConversations for AdminChatsPage:", error);
      toast.error("Gagal memuat percakapan chat.");
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [adminId]);

  React.useEffect(() => {
    if (!isSessionLoading && adminId) {
      fetchConversations();

      // Set up real-time subscription ONLY if adminId is available
      const channel = supabase
        .channel(`admin_conversations_${adminId}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for INSERT and UPDATE
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${adminId}`,
          },
          (payload) => {
            // Refetch all conversations to update unread counts and last messages
            fetchConversations();
            const newMsg = payload.new as ChatMessage;
            // Only show toast if it's a new message from a user
            if (payload.eventType === 'INSERT' && newMsg.sender_id !== adminId) {
              toast.info(`Pesan baru dari ${newMsg.sender_profile[0]?.first_name || 'Pengguna'}!`);
            }
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
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat percakapan...</p>
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="flex h-full items-center justify-center text-center p-4">
        <p className="text-muted-foreground">
          Anda harus login sebagai admin untuk melihat percakapan chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Percakapan</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada percakapan chat yang dimulai.
            </div>
          ) : (
            conversations.map((conv) => (
              <Link 
                href={`/admin/chats/${conv.user_id}`} 
                key={conv.user_id}
                className={`flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${pathname.includes(conv.user_id) ? 'bg-muted' : ''}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conv.user_avatar_url || undefined} />
                  <AvatarFallback>
                    {conv.user_first_name ? conv.user_first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium truncate">
                      {conv.user_first_name || "Pengguna"} {conv.user_last_name || ""}
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {conv.last_message}
                  </p>
                  {conv.unread_count > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {conv.unread_count} Pesan Baru
                    </Badge>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}