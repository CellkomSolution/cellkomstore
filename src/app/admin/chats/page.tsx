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

export default function AdminChatsPage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
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
      <div className="space-y-6 py-8">
        <h2 className="text-2xl font-bold">Memuat Percakapan Chat...</h2>
        <Card>
          <CardHeader><CardTitle><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Memuat...</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="space-y-6 py-8 text-center">
        <h2 className="text-2xl font-bold">Manajemen Chat</h2>
        <p className="text-muted-foreground">
          Anda harus login sebagai admin untuk melihat percakapan chat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Manajemen Chat</h2>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Percakapan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Pengguna</TableHead>
                  <TableHead>Detail Percakapan</TableHead>
                  <TableHead className="w-[150px]">Pesan Terakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Belum ada percakapan chat yang dimulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  conversations.map((conv) => (
                    <TableRow key={conv.user_id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.user_avatar_url || undefined} />
                          <AvatarFallback>
                            {conv.user_first_name ? conv.user_first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {conv.user_first_name || "Pengguna"} {conv.user_last_name || ""}
                        </div>
                        {conv.product_id && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            {conv.product_image_url && (
                              <Image
                                src={conv.product_image_url}
                                alt={conv.product_name || "Produk"}
                                width={24}
                                height={24}
                                className="rounded-sm object-cover mr-2"
                              />
                            )}
                            <span className="line-clamp-1">Tentang: {conv.product_name || "Produk Tidak Dikenal"}</span>
                          </div>
                        )}
                        {!conv.product_id && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Chat Umum</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">{conv.last_message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: id })}
                        </p>
                        {conv.unread_count > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            {conv.unread_count} Pesan Baru
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link href={`/admin/chats/${conv.user_id}`}>
                            Lihat Chat
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}