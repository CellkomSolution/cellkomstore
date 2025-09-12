"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, User as UserIcon, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Profile } from "@/lib/supabase/profiles"; 
import { getChatMessages, markMessagesAsRead, ChatMessage } from "@/lib/supabase/chats";
import { getProductById } from "@/lib/supabase/products";
import Link from "next/link";
import Image from "next/image";

export default function AdminChatDetailPage({ params }: { params: Promise<{ userId: string; productId: string }> }) {
  const { userId, productId: rawProductId } = React.use(params);
  const productId = rawProductId === 'general' ? null : rawProductId;
  const router = useRouter();
  const { user: adminUser, profile: adminProfile, isLoading: isSessionLoading } = useSession();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [otherUserProfile, setOtherUserProfile] = React.useState<Profile | null>(null);
  const [productInfo, setProductInfo] = React.useState<{ name: string; imageUrl: string } | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const adminId = adminUser?.id;

  React.useEffect(() => {
    async function loadUserProfileAndProduct() {
      if (adminId && adminUser) {
        const { data: userProfileData, error: userProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (userProfileError) {
          console.error("Error fetching user profile:", userProfileError.message);
          toast.error("Gagal memuat profil pengguna.");
          router.push("/admin/chats");
          return;
        }
        setOtherUserProfile(userProfileData);

        if (productId) {
          const product = await getProductById(productId);
          if (product) {
            setProductInfo({ name: product.name, imageUrl: product.imageUrl });
          }
        }
      }
    }
    loadUserProfileAndProduct();
  }, [userId, productId, adminUser, adminId, router]);

  const fetchMessages = React.useCallback(async () => {
    if (!adminUser || !adminId || !otherUserProfile) return;
    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await getChatMessages(userId, adminId, productId);
      setMessages(fetchedMessages);
      
      await markMessagesAsRead(userId, adminId, productId);
    } catch (error) {
      console.error("Error in fetchMessages for AdminChatDetailPage:", error);
      toast.error("Gagal memuat pesan chat.");
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [adminUser, adminId, otherUserProfile, userId, productId]);

  React.useEffect(() => {
    if (adminUser && adminId && otherUserProfile) {
      fetchMessages();

      const productFilter = productId ? `product_id=eq.${productId}` : `product_id=is.null`;
      const channel = supabase
        .channel(`admin_chat_${userId}_${productId || 'general'}`)
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
              (newMsg.sender_id === userId && newMsg.receiver_id === adminId) ||
              (newMsg.sender_id === adminId && newMsg.receiver_id === userId)
            ) {
              // When a new message comes in, we need to fetch the sender's profile
              // as the payload.new might not contain the joined profile data.
              // However, getChatMessages already fetches profiles, so we can just refetch all messages.
              // For real-time updates, it's better to append and then update the specific profile if needed.
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
  }, [adminUser, adminId, otherUserProfile, userId, productId, fetchMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminUser || isSending || !adminId || !otherUserProfile) return;

    setIsSending(true);
    const { data, error } = await supabase.from("chats").insert({
      product_id: productId,
      sender_id: adminUser.id,
      receiver_id: userId,
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

  if (isSessionLoading || !adminId || !otherUserProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat percakapan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Button>
        <h2 className="text-2xl font-bold">
          Chat dengan {otherUserProfile.first_name || "Pengguna"} {otherUserProfile.last_name || ""}
        </h2>
      </div>

      <Card className="flex flex-col h-[calc(100vh-200px)]">
        <CardHeader className="border-b p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUserProfile.avatar_url || undefined} />
              <AvatarFallback>
                {otherUserProfile.first_name ? otherUserProfile.first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {otherUserProfile.first_name || "Pengguna"} {otherUserProfile.last_name || ""}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{otherUserProfile.email}</p>
            </div>
          </div>
          {productInfo && (
            <Link href={`/product/${productId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:underline">
              <Image src={productInfo.imageUrl} alt={productInfo.name} width={32} height={32} className="rounded-md object-cover" />
              <span className="line-clamp-1">{productInfo.name}</span>
            </Link>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
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
                        msg.sender_id === adminUser?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender_id !== adminUser?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender_profile[0]?.avatar_url || undefined} />
                          <AvatarFallback>
                            {msg.sender_profile[0]?.first_name ? msg.sender_profile[0].first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_id === adminUser?.id
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card text-foreground rounded-bl-none border"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === adminUser?.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                      {msg.sender_id === adminUser?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender_profile[0]?.avatar_url || undefined} />
                          <AvatarFallback>
                            {msg.sender_profile[0]?.first_name ? msg.sender_profile[0].first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
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
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Ketik balasan Anda..."
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
        </div>
      </Card>
    </div>
  );
}