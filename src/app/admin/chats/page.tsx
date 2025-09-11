"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getChatConversations, ChatConversation } from "@/lib/supabase/chats"; // Import dari modul chats
import { getAdminUserId } from "@/lib/supabase/profiles"; // Import dari modul profiles
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Loader2, User as UserIcon, Package } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function AdminChatsPage() {
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [adminId, setAdminId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadAdminAndConversations() {
      setIsLoading(true);
      const currentAdminId = await getAdminUserId();
      setAdminId(currentAdminId);

      if (currentAdminId) {
        const fetchedConversations = await getChatConversations(currentAdminId);
        setConversations(fetchedConversations);
      }
      setIsLoading(false);
    }
    loadAdminAndConversations();
  }, []);

  if (isLoading) {
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
          Tidak dapat menemukan ID admin. Pastikan ada setidaknya satu pengguna dengan peran 'admin' di tabel profil Anda.
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
                    <TableRow key={`${conv.user_id}-${conv.product_id || 'general'}`}>
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
                            <span className="line-clamp-1">{conv.product_name || "Produk Tidak Dikenal"}</span>
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
                          <Link href={`/admin/chats/${conv.user_id}/${conv.product_id || 'general'}`}>
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