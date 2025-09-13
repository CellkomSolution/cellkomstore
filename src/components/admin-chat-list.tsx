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
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      const fetchedConversations = await getChatConversations(adminId);
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
            filter: `receiver_id=eq.${adminId}`,
          },
          (payload) => {
            fetchConversations();
            const newMsg = payload.new as ChatMessage;
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
      <CardContent className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat percakapan...</p>
      </CardContent>
    );
  }

  if (!adminId) {
    return (
      <CardContent className="flex-1 flex items-center justify-center text-center p-4">
        <p className="text-muted-foreground">
          Anda harus login sebagai admin untuk melihat percakapan chat.
        </p>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-1 p-0">
      <ScrollArea className="h-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Pengguna</TableHead>
              <TableHead>Pesan Terakhir</TableHead>
              <TableHead className="w-[150px] text-right">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Belum ada percakapan chat yang dimulai.
                </TableCell>
              </TableRow>
            ) : (
              conversations.map((conv) => (
                <TableRow 
                  key={conv.user_id} 
                  className={`cursor-pointer ${pathname.includes(conv.user_id) ? 'bg-muted' : ''}`}
                >
                  <TableCell>
                    <Link href={`/chats/${conv.user_id}`} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={conv.user_avatar_url || undefined} />
                        <AvatarFallback>
                          {conv.user_first_name ? conv.user_first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/chats/${conv.user_id}`} className="flex flex-col">
                      <div className="font-medium">
                        {conv.user_first_name || "Pengguna"} {conv.user_last_name || ""}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="mt-1 w-fit">
                          {conv.unread_count} Pesan Baru
                        </Badge>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    <Link href={`/chats/${conv.user_id}`}>
                      {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: id })}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </CardContent>
  );
}