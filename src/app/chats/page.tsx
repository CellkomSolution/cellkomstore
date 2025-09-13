"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, User as UserIcon, Loader2 } from "lucide-react";
import { useSession } from "@/context/session-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getChatParticipants } from "@/lib/supabase/chats";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client"; // Menambahkan import ini

export default function ChatsPage() {
  const { user: adminUser, isLoading: isSessionLoading } = useSession();
  const [chatParticipants, setChatParticipants] = React.useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = React.useState(true);

  React.useEffect(() => {
    async function fetchParticipants() {
      if (adminUser?.id) {
        setIsLoadingParticipants(true);
        const participants = await getChatParticipants(adminUser.id);
        setChatParticipants(participants);
        setIsLoadingParticipants(false);
      }
    }

    fetchParticipants();

    // Setup real-time listener for new messages to update the chat list
    const channel = adminUser?.id ? 
      supabase.channel(`admin_chat_list_${adminUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: `or(sender_id.eq.${adminUser.id},receiver_id.eq.${adminUser.id})`,
          },
          (payload) => {
            fetchParticipants(); // Re-fetch participants on new message
          }
        )
        .subscribe()
      : null;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [adminUser]);

  if (isSessionLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Memuat daftar chat...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
      {/* Left Panel: Chat List */}
      <Card className="flex flex-col border-r rounded-none shadow-none">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-xl">Daftar Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {isLoadingParticipants ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chatParticipants.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
              Belum ada percakapan.
            </div>
          ) : (
            <ScrollArea className="h-full">
              {chatParticipants.map((participant) => (
                <Link
                  key={participant.id}
                  href={`/admin/chats/${participant.id}`}
                  className="flex items-center gap-3 p-4 border-b hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.avatar_url || undefined} />
                    <AvatarFallback>
                      {participant.first_name ? participant.first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {participant.first_name || "Pengguna"} {participant.last_name || ""}
                      </p>
                      {participant.unreadCount > 0 && (
                        <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                          {participant.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {participant.latestMessage || "Mulai percakapan..."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {participant.latestTimestamp ? formatDistanceToNow(new Date(participant.latestTimestamp), { addSuffix: true, locale: id }) : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Right Panel: Placeholder */}
      <Card className="h-full flex flex-col border-none shadow-none">
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Laptop className="h-24 w-24 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">Selamat Datang di Fitur Chat Admin</h2>
          <p className="text-muted-foreground max-w-md">
            Pilih percakapan dari daftar di sebelah kiri untuk melihat detail chat dan mulai membalas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}