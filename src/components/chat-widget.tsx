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
import { getProductById, mapProductData } from "@/lib/supabase/products"; // Import mapProductData
import Link from "next/link"; // Import Link for product links

interface ChatWidgetProps {
  productId?: string | null;
  productName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatWidget({ productId, productName, open, onOpenChange }: ChatWidgetProps) {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [targetAdminId, setTargetAdminId] = React.useState<string | null>(null);
  const [isLoadingAdminId, setIsLoadingAdminId] = React.useState(true);
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

    for (const msg of fetchedMessages) {
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
            is_read: true,
            updated_at: msg.created_at,
            sender_profile: [],
            receiver_profile: [],
            products: [product], // Fixed: Pass the full product object
            type: 'system',
          });
          productsIntroduced.add(msg.product_id);
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
      sender_id: user.id,
      receiver_id: targetAdminId,
      message: newMessage.trim(),
    }).select(`
      *,
      sender_profile:profiles!sender_id (first_name, last_name, avatar_url, role),
      receiver_profile:profiles!receiver_id (first_name, last_name, avatar_url, role),
      products (id, name, price, original_price, image_url, location, rating, sold_count, category, is_flash_sale, description)
    `).single();

    if (error) {
      console.error("Error sending message:", error.message);
      toast.error("Gagal mengirim pesan.");
    } else if (data) {
      // Map product data from snake_case to camelCase for the new message
      const mappedData = {
        ...data,
        products: data.products ? data.products.map(mapProductData) : [],
      };
      setMessages((prev) => [...prev, mappedData as ChatMessage]);
      setNewMessage("");
    }
    setIsSending(false);
  };

  const Title = () => <p>Chat {productName ? `tentang ${productName}` : 'Admin'}</p>;

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
                      msg.type === 'system' ? 'justify-center' : (msg.sender_id === user.id ? "justify-end" : "justify-start")
                    }`}
                  >
                    {msg.type === 'system' ? (
                      <div className="w-full text-center text-muted-foreground text-sm my-2">
                        {msg.products?.[0] && (
                          <div className="inline-flex items-center gap-2 p-2 bg-muted rounded-md border">
                            <Image src={msg.products[0].imageUrl} alt={msg.products[0].name} width={32} height={32} className="rounded-sm object-cover" />
                            <span>
                              Percakapan tentang: <Link href={`/product/${msg.product_id}`} className="underline hover:text-primary">{msg.products[0].name}</Link>
                            </span>
                          </div>
                        )}
                        {!msg.products?.[0] && msg.message}
                      </div>
                    ) : (
                      <>
                        {msg.sender_id !== user.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.sender_profile[0]?.avatar_url || undefined} />
                            <AvatarFallback>
                              {msg.sender_profile[0]?.first_name ? msg.sender_profile[0].first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
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
                          {msg.product_id && msg.products?.[0] && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md">
                              <Image src={msg.products[0].imageUrl} alt={msg.products[0].name} width={32} height={32} className="rounded-sm object-cover" />
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                Tentang: <Link href={`/product/${msg.product_id}`} className="underline hover:text-primary">{msg.products[0].name}</Link>
                              </span>
                            </div>
                          )}
                          <p className={`text-xs mt-1 ${msg.sender_id === user.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                          </p>
                        </div>
                        {msg.sender_id === user.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.sender_profile[0]?.avatar_url || undefined} />
                            <AvatarFallback>
                              {profile?.first_name ? profile.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
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