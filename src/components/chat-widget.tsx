"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, User as UserIcon, Package, ReceiptText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAdminUserId } from "@/lib/supabase/profiles";
import { ChatMessage, getChatMessages, markMessagesAsRead } from "@/lib/supabase/chats";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { getProductById, mapProductData, Product } from "@/lib/supabase/products";
import { getOrderById, Order } from "@/lib/supabase/orders";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { createNotification } from "@/lib/supabase/notifications";

// Import new chat components
import { ChatHeader } from "./chat/chat-header";
import { ChatMessages } from "./chat/chat-messages";
import { ChatInput } from "./chat/chat-input";

interface ChatWidgetProps {
  productId?: string | null;
  productName?: string | null;
  orderId?: string | null;
  orderName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatWidget({ productId, productName, orderId, orderName, open, onOpenChange }: ChatWidgetProps) {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [targetAdminId, setTargetAdminId] = React.useState<string | null>(null);
  const [isLoadingAdminId, setIsLoadingAdminId] = React.useState(true);
  const [productContext, setProductContext] = React.useState<Product | null>(null);
  const [orderContext, setOrderContext] = React.useState<Order | null>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    async function loadAdminId() {
      setIsLoadingAdminId(true);
      const id = await getAdminUserId();
      setTargetAdminId(id);
      setIsLoadingAdminId(false);
    }
    loadAdminId();
  }, []);

  React.useEffect(() => {
    async function loadContextData() {
      if (productId) {
        const product = await getProductById(productId);
        setProductContext(product);
      } else {
        setProductContext(null);
      }
      if (orderId) {
        const order = await getOrderById(orderId);
        setOrderContext(order);
      } else {
        setOrderContext(null);
      }
    }
    loadContextData();
  }, [productId, orderId]);

  const fetchMessages = React.useCallback(async () => {
    if (!user || !targetAdminId) return;
    
    if (user.id === targetAdminId) {
      setIsLoadingMessages(false);
      setMessages([]);
      toast.info("Anda tidak dapat memulai chat dengan diri sendiri melalui widget ini.");
      onOpenChange(false);
      return;
    }

    setIsLoadingMessages(true);
    const fetchedMessages = await getChatMessages(user.id, targetAdminId);
    
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
            receiver_id: user.id,
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
            receiver_id: user.id,
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
    setIsLoadingMessages(false);

    try {
      await markMessagesAsRead(targetAdminId, user.id);
    } catch (error) {
      console.error("Failed to mark messages as read in ChatWidget:", error);
    }
  }, [user, targetAdminId, onOpenChange]);

  React.useEffect(() => {
    if (open && user && targetAdminId) {
      fetchMessages();

      if (user.id === targetAdminId) {
        return;
      }

      const channelName = `unified_chat_${user.id}_${targetAdminId}`;

      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chats",
            filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (
              (newMsg.sender_id === user.id && newMsg.receiver_id === targetAdminId) ||
              (newMsg.sender_id === targetAdminId && newMsg.receiver_id === user.id)
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
  }, [open, user, targetAdminId, fetchMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending || !targetAdminId) {
      if (!targetAdminId) toast.error("Admin tidak ditemukan untuk chat.");
      return;
    }

    if (user.id === targetAdminId) {
      toast.info("Anda tidak dapat mengirim pesan ke diri sendiri melalui widget ini.");
      setNewMessage("");
      return;
    }

    setIsSending(true);
    const { data, error } = await supabase.from("chats").insert({
      product_id: productId || null,
      order_id: orderId || null,
      sender_id: user.id,
      receiver_id: targetAdminId,
      message: newMessage.trim(),
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

      // Create notification for the admin
      if (targetAdminId) {
        const senderName = profile?.first_name || user.email?.split('@')[0] || "Pengguna";
        const notificationTitle = `Pesan Baru dari ${senderName}`;
        const notificationMessage = `Anda memiliki pesan baru dari ${senderName} di chat.`;
        const notificationLink = `/chats/${user.id}`; // Link to admin's chat with this user

        await createNotification(targetAdminId, 'new_message', notificationTitle, notificationMessage, notificationLink);
      }
    }
    setIsSending(false);
  };

  const Title = () => {
    if (orderName) return <p>Chat tentang {orderName}</p>;
    if (productName) return <p>Chat tentang {productName}</p>;
    return <p>Chat Admin</p>;
  };

  if (isSessionLoading || isLoadingAdminId) {
    const Content = () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Memuat informasi chat...</p>
      </div>
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

  if (!user) {
    const Content = () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Anda harus masuk untuk memulai chat.</p>
        <Button asChild>
          <a href="/auth">Masuk / Daftar</a>
        </Button>
      </div>
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

  if (!targetAdminId) {
    const Content = () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <p className="font-semibold">Admin tidak tersedia untuk chat.</p>
        <p className="text-sm text-muted-foreground">
          Silakan coba lagi nanti atau hubungi dukungan.
        </p>
      </div>
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

  const ChatContent = (
    <>
      <div className="flex-1 flex flex-col overflow-hidden border rounded-md bg-muted/20">
        <ChatMessages
          messages={messages}
          currentUser={user}
          currentUserProfile={profile}
          isLoadingMessages={isLoadingMessages}
          messagesEndRef={messagesEndRef}
          isAdminView={false} // This is the user's widget, so not admin view
        />
      </div>
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        isSending={isSending}
        onSendMessage={handleSendMessage}
      />
    </>
  );

  const chatHeaderProps = {
    otherUserProfile: {
      id: targetAdminId,
      first_name: "Admin",
      last_name: null,
      avatar_url: null,
      role: 'admin',
      email: "admin@example.com", // Placeholder, actual admin email might not be exposed
    },
    currentUserName: profile?.first_name || user.email?.split('@')[0] || "Pengguna",
    currentUserAvatar: profile?.avatar_url || undefined,
    orderContext: orderContext,
    productContext: productContext,
    isMobile: isMobile,
    onBackClick: () => onOpenChange(false),
    isAdminView: false,
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] flex flex-col">
          <ChatHeader {...chatHeaderProps} />
          {ChatContent}
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-6">
          <ChatHeader {...chatHeaderProps} />
          {ChatContent}
        </SheetContent>
      </Sheet>
    );
  }
}