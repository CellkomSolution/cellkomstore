"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale"; // Import Indonesian locale for date-fns
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  product_id: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
  };
}

interface ChatWidgetProps {
  productId: string;
  productName: string;
}

export function ChatWidget({ productId, productName }: ChatWidgetProps) {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const adminId = "00000000-0000-0000-0000-000000000001"; // Placeholder for a generic admin ID. In a real app, you'd fetch a specific admin.

  const fetchMessages = React.useCallback(async () => {
    if (!user) return;
    setIsLoadingMessages(true);
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        profiles (first_name, last_name, avatar_url, role)
      `)
      .eq("product_id", productId)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
      toast.error("Gagal memuat pesan chat.");
    } else {
      setMessages(data || []);
    }
    setIsLoadingMessages(false);
  }, [user, productId]);

  React.useEffect(() => {
    if (isChatOpen && user) {
      fetchMessages();

      // Realtime subscription for new messages
      const channel = supabase
        .channel(`product_chat_${productId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            // Only add if the message is relevant to the current user (sender or receiver)
            if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
              // Fetch profile data for the new message
              supabase.from('profiles').select('first_name, last_name, avatar_url, role').eq('id', newMsg.sender_id).single()
                .then(({ data: profileData, error: profileError }) => {
                  if (!profileError && profileData) {
                    setMessages((prev) => [...prev, { ...newMsg, profiles: profileData }]);
                  } else {
                    setMessages((prev) => [...prev, newMsg]); // Add without profile if error
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
  }, [isChatOpen, user, productId, fetchMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    const { data, error } = await supabase.from("chats").insert({
      product_id: productId,
      sender_id: user.id,
      receiver_id: adminId, // Assuming admin is the receiver
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

  if (isSessionLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shrink-0">
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Chat Penjual</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat Penjual</DialogTitle>
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
    <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shrink-0">
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Chat Penjual</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col h-[90vh] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Chat tentang {productName}</DialogTitle>
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