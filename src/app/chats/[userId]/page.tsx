"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, User as UserIcon, ArrowLeft, Package, ReceiptText } from "lucide-react"; // Package dan ReceiptText diimpor secara eksplisit
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Profile } from "@/lib/supabase/profiles"; 
import { getChatMessages, markMessagesAsRead, ChatMessage } from "@/lib/supabase/chats";
import { getProductById, Product, mapProductData } from "@/lib/supabase/products";
import { getOrderById, Order } from "@/lib/supabase/orders"; // Import getOrderById and Order
import Link from "next/link";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah
import { createNotification } from "@/lib/supabase/notifications"; // Import createNotification

interface AdminChatDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default function AdminChatDetailPage({ params }: AdminChatDetailPageProps) {
  const { userId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");

  const { user: adminUser, profile: adminProfile, isLoading: isSessionLoading } = useSession();
  const isMobile = useIsMobile();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [otherUserProfile, setOtherUserProfile] = React.useState<Profile | null>(null);
  const [orderContext, setOrderContext] = React.useState<Order | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);

  const adminId = adminUser?.id;

  React.useEffect(() => {
    async function loadUserProfile() {
      if (adminId && adminUser) {
        const { data: userProfileData, error: userProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (userProfileError) {
          console.error("Error fetching user profile:", userProfileError.message);
          toast.error("Gagal memuat profil pengguna.");
          return;
        }
        setOtherUserProfile(userProfileData);
      }
    }
    loadUserProfile();
  }, [userId, adminUser, adminId]);

  // Effect to load order context and potentially pre-fill message
  React.useEffect(() => {
    async function loadOrderContextAndPrefill() {
      if (orderIdFromUrl) {
        const order = await getOrderById(orderIdFromUrl);
        if (order) {
          setOrderContext(order);
          // Only pre-fill if newMessage is currently empty
          if (newMessage === "") {
            const orderLink = `${window.location.origin}/my-orders/${order.id}`; // Link to user's order page
            setNewMessage(`Halo, saya ingin membahas pesanan #${order.id.substring(0, 8)} Anda. Detail pesanan: ${orderLink}`);
          }
        } else {
          toast.error("Detail pesanan tidak ditemukan.");
          setOrderContext(null);
        }
      } else {
        setOrderContext(null);
        // If orderId is removed from URL, clear pre-filled message if it was order-related
        if (newMessage.includes("pesanan #") && newMessage.includes("Detail pesanan:")) {
            setNewMessage("");
        }
      }
    }
    loadOrderContextAndPrefill();
  }, [orderIdFromUrl, newMessage]);

  const fetchMessages = React.useCallback(async () => {
    if (!adminUser || !adminId || !otherUserProfile) return;
    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await getChatMessages(userId, adminId);
      
      const finalMessages: ChatMessage[] = [];
      const productsIntroduced = new Set<string>();
      const ordersIntroduced = new Set<string>();

      for (const msg of fetchedMessages) {
        // System message for product
        if (msg.product_id && !productsIntroduced.has(msg.product_id)) {
          const product = await getProductById(msg.product_id);
          if (product) {
            finalMessages.push({
              id: `system-product-intro-${msg.product_id}-${msg.id}`,
              sender_id: 'system-id',
              receiver_id: adminId,
              message: `Percakapan ini dimulai terkait produk: ${product.name}`,
              created_at: msg.created_at,
              product_id: product.id,
              order_id: null,
              is_read: true,
              updated_at: msg.created_at,
              sender_profile: [],
              receiver_profile: [],
              products: [product],
              type: 'system',
            });
            productsIntroduced.add(msg.product_id);
          }
        }
        // System message for order
        if (msg.order_id && !ordersIntroduced.has(msg.order_id)) {
          const order = await getOrderById(msg.order_id);
          if (order) {
            finalMessages.push({
              id: `system-order-intro-${msg.order_id}-${msg.id}`,
              sender_id: 'system-id',
              receiver_id: adminId,
              message: `Percakapan ini dimulai terkait pesanan: #${order.id.substring(0, 8)}`,
              created_at: msg.created_at,
              product_id: null,
              order_id: order.id,
              is_read: true,
              updated_at: msg.created_at,
              sender_profile: [],
              receiver_profile: [],
              order: order,
              type: 'system',
            });
            ordersIntroduced.add(msg.order_id);
          }
        }
        finalMessages.push(msg);
      }

      setMessages(finalMessages);
      
      await markMessagesAsRead(userId, adminId);
    } catch (error) {
      console.error("Error in fetchMessages for AdminChatDetailPage:", error);
      toast.error("Gagal memuat pesan chat.");
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [adminUser, adminId, otherUserProfile, userId]);

  React.useEffect(() => {
    if (adminUser && adminId && otherUserProfile) {
      fetchMessages();

      const channel = supabase
        .channel(`admin_chat_user_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (
              (newMsg.sender_id === userId && newMsg.receiver_id === adminId) ||
              (newMsg.sender_id === adminId && newMsg.receiver_id === userId)
            ) {
              fetchMessages();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [adminUser, adminId, otherUserProfile, userId, fetchMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminUser || isSending || !adminId || !otherUserProfile) return;

    setIsSending(true);
    const { data, error } = await supabase.from("chats").insert({
      sender_id: adminUser.id,
      receiver_id: userId,
      message: newMessage.trim(),
      product_id: null,
      order_id: orderIdFromUrl,
    }).select(`
      *,
      sender_profile:profiles!sender_id (first_name, last_name, avatar_url, role),
      receiver_profile:profiles!receiver_id (first_name, last_name, avatar_url, role),
      products (id, name, price, original_price, main_image_url, location, rating, sold_count, category, is_flash_sale, description),
      order:orders!order_id(id, total_amount, order_status, payment_status, payment_unique_code)
    `).single();

    if (error) {
      console.error("Error sending message:", error.message);
      toast.error("Gagal mengirim pesan.");
    } else if (data) {
      const mappedData = {
        ...data,
        products: data.products ? [mapProductData(data.products)] : [],
        order: data.order as Order | undefined,
      };
      setMessages((prev) => [...prev, mappedData as ChatMessage]);
      setNewMessage("");

      // Create notification for the user (recipient of this message)
      if (otherUserProfile) {
        const notificationTitle = `Pesan Baru dari Admin`;
        const notificationMessage = `Anda memiliki pesan baru dari Admin di chat.`;
        // Link to user's order page if chat is order-related, otherwise null for general chat
        const notificationLink = orderIdFromUrl ? `/my-orders/${orderIdFromUrl}` : null; 

        await createNotification(userId, 'new_message', notificationTitle, notificationMessage, notificationLink);
      }
    }
    setIsSending(false);
  };

  const ChatHeaderContent = (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={() => {
        setIsDrawerOpen(false);
        router.push("/chats");
      }}>
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Kembali</span>
      </Button>
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherUserProfile?.avatar_url || undefined} />
        <AvatarFallback>
          {otherUserProfile?.first_name ? otherUserProfile.first_name[0].toUpperCase() : (otherUserProfile?.email ? otherUserProfile.email[0].toUpperCase() : <UserIcon className="h-5 w-5" />)}
        </AvatarFallback>
      </Avatar>
      <div>
        <CardTitle className="text-lg">
          {otherUserProfile?.first_name || "Pengguna"} {otherUserProfile?.last_name || ""}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{otherUserProfile?.email}</p>
        {orderContext && (
          <p className="text-xs text-primary mt-1">
            Membahas Pesanan: <Link href={`/admin/orders/${orderContext.id}`} className="underline hover:text-primary">#{orderContext.id.substring(0, 8)}</Link> (Total: {formatRupiah(orderContext.total_amount + orderContext.payment_unique_code)})
            <span className="ml-2 text-xs">
              (Status: {orderContext.order_status}, Pembayaran: {orderContext.payment_status}, Kode Unik: {orderContext.payment_unique_code})
            </span>
          </p>
        )}
      </div>
    </div>
  );

  const ChatBodyContent = (
    <>
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
                      msg.type === 'system' ? 'justify-center' : (msg.sender_id === adminUser?.id ? "justify-end" : "justify-start")
                    }`}
                  >
                    {msg.type === 'system' ? (
                      <div className="w-full text-center text-muted-foreground text-sm my-2">
                        {msg.products?.[0] && (
                          <div className="inline-flex items-center gap-2 p-2 bg-muted rounded-md border">
                            {msg.products[0].imageUrl ? (
                              <Image src={msg.products[0].imageUrl} alt={msg.products[0].name} width={32} height={32} className="rounded-sm object-cover" />
                            ) : (
                              <div className="h-8 w-8 bg-gray-200 rounded-sm flex items-center justify-center text-xs">No Img</div>
                            )}
                            <span>
                              Percakapan tentang: <Link href={`/product/${msg.product_id}`} className="underline hover:text-primary">{msg.products[0].name}</Link>
                            </span>
                          </div>
                        )}
                        {msg.order && (
                          <div className="inline-flex items-center gap-2 p-2 bg-muted rounded-md border">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span>
                              Percakapan tentang Pesanan: <Link href={`/admin/orders/${msg.order.id}`} className="underline hover:text-primary">#{msg.order.id.substring(0, 8)}</Link>
                              <span className="ml-2 text-xs">
                                (Status: {msg.order.order_status}, Pembayaran: {msg.order.payment_status}, Kode Unik: {msg.order.payment_unique_code})
                              </span>
                            </span>
                          </div>
                        )}
                        {!msg.products?.[0] && !msg.order && msg.message}
                      </div>
                    ) : (
                      <>
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
                          {msg.product_id && msg.products?.[0] && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md">
                              {msg.products[0].imageUrl ? (
                                <Image src={msg.products[0].imageUrl} alt={msg.products[0].name} width={32} height={32} className="rounded-sm object-cover" />
                              ) : (
                                <div className="h-8 w-8 bg-gray-200 rounded-sm flex items-center justify-center text-xs">No Img</div>
                              )}
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                Tentang: <Link href={`/product/${msg.product_id}`} className="underline hover:text-primary">{msg.products[0].name}</Link>
                              </span>
                            </div>
                          )}
                          {msg.order_id && msg.order && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                Tentang Pesanan: <Link href={`/admin/orders/${msg.order.id}`} className="underline hover:text-primary">#{msg.order.id.substring(0, 8)}</Link>
                                <span className="ml-2 text-xs">
                                  (Status: {msg.order.order_status}, Pembayaran: {msg.order.payment_status}, Kode Unik: {msg.order.payment_unique_code})
                                </span>
                              </span>
                            </div>
                          )}
                          <p className={`text-xs mt-1 ${msg.sender_id === adminUser?.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                          </p>
                        </div>
                        {msg.sender_id === adminUser?.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={adminProfile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {adminProfile?.first_name ? adminProfile.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </>
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
    </>
  );

  if (isSessionLoading || !adminId || !otherUserProfile) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Detail Chat Admin</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2">Memuat percakapan...</p>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open);
        if (!open) {
          router.push("/chats");
        }
      }}>
        <DrawerContent className="h-[90vh] flex flex-col">
          <DrawerHeader className="p-4 border-b">
            <DrawerTitle>{ChatHeaderContent}</DrawerTitle>
          </DrawerHeader>
          {ChatBodyContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b p-4 flex flex-row items-center justify-between">
        {ChatHeaderContent}
      </div>
      {ChatBodyContent}
    </Card>
  );
}