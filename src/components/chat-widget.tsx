"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Hapus DialogTrigger
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAdminUserId } from "@/lib/supabase/profiles";
import { ChatMessage } from "@/lib/supabase/chats";

interface ChatWidgetProps {
  productId?: string | null; // Opsional
  productName?: string | null; // Opsional
  open: boolean; // Dikontrol secara eksternal
  onOpenChange: (open: boolean) => void; // Dikontrol secara eksternal
}

export function ChatWidget({ productId, productName, open, onOpenChange }: ChatWidgetProps) {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [targetAdminId, setTargetAdminId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadAdminId() {
      const id = await getAdminUserId();
      setTargetAdminId(id);
    }
    loadAdminId();
  }, []);

  const fetchMessages = React.useCallback(async () => {
    if (!user || !targetAdminId) return;
    setIsLoadingMessages(true);

    let query = supabase
      .from("chats")
      .select(`
        *,
        profiles (first_name, last_name, avatar_url, role)
      `)
      .order("created_at", { ascending: true });

    if (productId) {
      query = query.eq("product_id", productId);
    } else {
      query = query.is("product_id", null);
    }

    query = query.or(`(sender_id.eq.${user.id},receiver_id.eq.${targetAdminId}),(sender_id.eq.${targetAdminId},receiver_id.eq.${user.id})`);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error.message);
      toast.error("Gagal memuat pesan chat.");
    } else {
      setMessages(data || []);
    }
    setIsLoadingMessages(false);
  }, [user, productId, targetAdminId]);

  React.useEffect(() => {
    if (open && user && targetAdminId) {
      fetchMessages();

      const productFilter = productId ? `product_id=eq.${productId}` : `product_id=is.null`;
      const channelName = `product_chat_${productId || 'general'}_${user.id}_${targetAdminId}`;

      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: productFilter,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (
              (newMsg.sender_id === user.id && newMsg.receiver_id === targetAdminId) ||
              (newMsg.sender_id === targetAdminId && newMsg.receiver_id === user.id)
            ) {
              supabase.from('profiles').select('first_name, last_name, avatar_url, role').eq('id', newMsg.sender_id).single()
                .then(({ data: profileData, error: profileError }) => {
                  if (!profileError && profileData) {
                    setMessages((prev) => [...prev, { ...newMsg, profiles: profileData }]);
                  } else {
                    setMessages((prev) => [...prev, newMsg]);
                  }
                });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, user, productId, targetAdminId, fetchMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending || !targetAdminId) {
      if (!targetAdminId) toast.error("Admin tidak ditemukan untuk chat.");
      return;
    }

    setIsSending(true);
    const { data, error } = await supabase.from("chats").insert({
      product_id: productId || null, // Pastikan null jika tidak ada productId
      sender_id: user.id,
      receiver_id: targetAdminId,
      message: newMessage.trim(),
    }).select(`
      *,
      profiles (first_name, last_name, avatar_url, role)
    `).single();

    if (error) {
      console.error("Error sending message:", error.message);
      toast.error("Gagal mengirim pesan.");
    } else if (data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    }
    setIsSending(false);
  };

  if (isSessionLoading || !targetAdminId) {
    return null;
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat {productName ? `tentang ${productName}` : 'Admin'}</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground">Anda harus masuk untuk memulai chat.</p>
          <Button asChild>
            <a href="/auth">Masuk / Daftar</a>
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] flex flex-col h-[90vh] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Chat {productName ? `tentang ${productName}` : 'Umum'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden border rounded-md bg-muted/20">
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">
                    Belum ada pesan. Mulai chat Anda sekarang!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${
                        msg.sender_id === user.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender_id !== user.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {msg.profiles?.first_name ? msg.profiles.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_id === user.id
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card text-foreground rounded-bl-none border"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                      {msg.sender_id === user.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {profile?.first_name ? profile.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
          <Input
            placeholder="Ketik pesan Anda..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Kirim</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}