"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, User as UserIcon, ArrowLeft, Package, ReceiptText } from "lucide-react";
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
import { getOrderById, Order } from "@/lib/supabase/orders";
import Link from "next/link";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatRupiah } from "@/lib/utils";
import { createNotification } from "@/lib/supabase/notifications";

// Import new chat components
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";

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
            const orderLink = `${window.location.origin}/admin/orders/${order.id}`;
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
        const notificationLink = orderIdFromUrl ? `/my-orders/${orderIdFromUrl}` : `/notifications`; // Link to user's order or general notifications

        await createNotification(userId, 'new_message', notificationTitle, notificationMessage, notificationLink);
      }
    }
    setIsSending(false);
  };

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

  const chatHeaderProps = {
    otherUserProfile: otherUserProfile,
    currentUserName: adminProfile?.first_name || adminUser?.email?.split('@')[0] || "Admin",
    currentUserAvatar: adminProfile?.avatar_url || undefined,
    orderContext: orderContext,
    isMobile: isMobile,
    onBackClick: () => router.push("/chats"),
    isAdminView: true,
  };

  const ChatBodyContent = (
    <>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <ChatMessages
          messages={messages}
          currentUser={adminUser}
          currentUserProfile={adminProfile}
          isLoadingMessages={isLoadingMessages}
          messagesEndRef={messagesEndRef}
          isAdminView={true} // This is the admin view
        />
      </CardContent>
      <div className="border-t p-4">
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isSending={isSending}
          onSendMessage={handleSendMessage}
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open);
        if (!open) {
          router.push("/chats");
        }
      }}>
        <DrawerContent className="h-[90vh] flex flex-col">
          <ChatHeader {...chatHeaderProps} />
          {ChatBodyContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader {...chatHeaderProps} />
      {ChatBodyContent}
    </Card>
  );
}