"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getChatConversations, ChatConversation, ChatMessage } from "@/lib/supabase/chats";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Loader2, User as UserIcon, Search } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

export function AdminChatList() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
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
            event: "*", // Listen for INSERT and UPDATE
            schema: "public",
            table: "chats",
            filter: `receiver_id=eq.${adminId}`,
          },
          async (payload) => {
            await fetchConversations();
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

  const filteredConversations = conversations.filter(conv => 
    (conv.user_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     conv.user_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     conv.last_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
     conv.product_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isSessionLoading || isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari chat..." className="pl-8" disabled />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Anda harus login sebagai admin untuk melihat percakapan chat.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari chat..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            {searchTerm ? "Tidak ada percakapan yang cocok." : "Belum ada percakapan chat yang dimulai."}
          </p>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = pathname === `/admin/chats/${conv.user_id}`;
            return (
              <Link key={conv.user_id} href={`/admin/chats/${conv.user_id}`}>
                <div className={`flex items-center gap-3 p-4 border-b hover:bg-muted/50 transition-colors ${isActive ? 'bg-muted' : ''}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.user_avatar_url || undefined} />
                    <AvatarFallback>
                      {conv.user_first_name ? conv.user_first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="font-medium truncate">
                        {conv.user_first_name || "Pengguna"} {conv.user_last_name || ""}
                      </div>
                      <p className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                      {conv.product_id && conv.product_image_url && (
                        <Image
                          src={conv.product_image_url}
                          alt={conv.product_name || "Produk"}
                          width={16}
                          height={16}
                          className="rounded-sm object-cover mr-1"
                        />
                      )}
                      <span className="line-clamp-1 flex-1">
                        {conv.last_message}
                      </span>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs flex-shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}