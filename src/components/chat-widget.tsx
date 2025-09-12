"use client";

import * as React from "react";
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
import { ChatMessage, getChatMessages, markMessagesAsRead } from "@/lib/supabase/chats"; // Import markMessagesAsRead
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile hook
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"; // Import Drawer components
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; // Import Sheet components

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
  const isMobile = useIsMobile(); // Determine if it's a mobile view

  React.useEffect(() => {
    async function loadAdminId() {
      const id = await getAdminUserId();
      setTargetAdminId(id);
    }
    loadAdminId();
  }, []);

  const fetchMessages = React.useCallback(async () => {
    if (!user || !targetAdminId) return;
    
    // Pencegahan: Jika pengguna adalah admin yang sama dengan target admin,
    // ini bukan skenario chat pelanggan-ke-admin yang dimaksud.
    if (user.id === targetAdminId) {
      setIsLoadingMessages(false);
      setMessages([]); // Kosongkan pesan sebelumnya
      toast.info("Anda tidak dapat memulai chat dengan diri sendiri melalui widget ini.");
      onOpenChange(false); // Tutup widget chat
      return;
    }

    setIsLoadingMessages(true);
    const fetchedMessages = await getChatMessages(user.id, targetAdminId, productId ?? null);
    setMessages(fetchedMessages);
    setIsLoadingMessages(false);

    // Tandai pesan dari admin ke user sebagai sudah dibaca
    try {
      await markMessagesAsRead(targetAdminId, user.id, productId ?? null);
    } catch (error) {
      console.error("Failed to mark messages as read in ChatWidget:", error);
    }
  }, [user, productId, targetAdminId, onOpenChange]);

  React.useEffect(() => {
    if (open && user && targetAdminId) {
      fetchMessages();

      // Pencegahan duplikat channel jika user.id === targetAdminId
      if (user.id === targetAdminId) {
        return;
      }

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
              // When a new message comes in, we need to fetch the sender's profile
              // as the payload.new might not contain the joined profile data.
              // For simplicity and to ensure consistency with the full message structure,
              // we'll refetch all messages.
              fetchMessages(); // Refetch all messages to get full profile data
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

    // Pencegahan: Jika pengguna adalah admin yang sama dengan target admin
    if (user.id === targetAdminId) {
      toast.info("Anda tidak dapat mengirim pesan ke diri sendiri melalui widget ini.");
      setNewMessage("");
      return;
    }

    setIsSending(true);
    const { data, error } = await supabase.from("chats").insert({
      product_id: productId || null,
      sender_id: user.id,
      receiver_id: targetAdminId,
      message: newMessage.trim(),
    }).select(`
      *,
      sender_profile:profiles!sender_id (first_name, last_name, avatar_url, role),
      receiver_profile:profiles!receiver_id (first_name, last_name, avatar_url, role)
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

  const ChatContent = (
    <>
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
                      msg.sender_id === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender_profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {msg.sender_profile.first_name ? msg.sender_profile.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-foreground rounded-bl-none border"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    {msg.sender_id === user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender_profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {msg.sender_profile.first_name ? msg.sender_profile.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
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
    </>
  );

  if (isSessionLoading || !targetAdminId) {
    return null;
  }

  if (!user) {
    // If not logged in, show a simple dialog to prompt login
    const Title = () => <p>Chat {productName ? `tentang ${productName}` : 'Admin'}</p>;
    const Content = () => (
      <>
        <p className="text-center text-muted-foreground">Anda harus masuk untuk memulai chat.</p>
        <Button asChild>
          <a href="/auth">Masuk / Daftar</a>
        </Button>
      </>
    );

    if (isMobile) {
      return (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[300px] flex flex-col p-4">
            <DrawerHeader className="text-center">
              <DrawerTitle><Title /></DrawerTitle>
            </DrawerHeader>
            <Content />
          </DrawerContent>
        </Drawer>
      );
    } else {
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-6">
            <SheetHeader>
              <SheetTitle><Title /></SheetTitle>
            </SheetHeader>
            <Content />
          </SheetContent>
        </Sheet>
      );
    }
  }

  // Render actual chat widget based on device
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] flex flex-col p-4">
          <DrawerHeader className="text-center">
            <DrawerTitle>Chat {productName ? `tentang ${productName}` : 'Umum'}</DrawerTitle>
          </DrawerHeader>
          {ChatContent}
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-6">
          <SheetHeader>
            <SheetTitle>Chat {productName ? `tentang ${productName}` : 'Umum'}</SheetTitle>
          </SheetHeader>
          {ChatContent}
        </SheetContent>
      </Sheet>
    );
  }
}