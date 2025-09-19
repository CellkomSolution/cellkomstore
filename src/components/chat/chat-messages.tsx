"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area"; // Memastikan impor yang benar
import { Loader2, User as UserIcon, Package, ReceiptText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { ChatMessage } from "@/lib/supabase/chats";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/supabase/profiles";
import { Order } from "@/lib/supabase/orders";
import { Product } from "@/lib/supabase/products";
import { formatRupiah } from "@/lib/utils";

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUser: User | null;
  currentUserProfile: Profile | null;
  isLoadingMessages: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isAdminView?: boolean; // To differentiate admin view for order links
}

export function ChatMessages({
  messages,
  currentUser,
  currentUserProfile,
  isLoadingMessages,
  messagesEndRef,
  isAdminView = false,
}: ChatMessagesProps) {
  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
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
                msg.type === 'system' ? 'justify-center' : (msg.sender_id === currentUser?.id ? "justify-end" : "justify-start")
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
                        Percakapan tentang Pesanan:{" "}
                        <Link
                          href={isAdminView ? `/admin/orders/${msg.order.id}` : `/my-orders/${msg.order.id}`}
                          className="underline hover:text-primary"
                        >
                          #{msg.order.id.substring(0, 8)}
                        </Link>
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
                  {msg.sender_id !== currentUser?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender_profile[0]?.avatar_url || undefined} />
                      <AvatarFallback>
                        {msg.sender_profile[0]?.first_name ? msg.sender_profile[0].first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender_id === currentUser?.id
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
                          Tentang Pesanan:{" "}
                          <Link
                            href={isAdminView ? `/admin/orders/${msg.order.id}` : `/my-orders/${msg.order.id}`}
                            className="underline hover:text-primary"
                          >
                            #{msg.order.id.substring(0, 8)}
                          </Link>
                          <span className="ml-2 text-xs">
                            (Status: {msg.order.order_status}, Pembayaran: {msg.order.payment_status}, Kode Unik: {msg.order.payment_unique_code})
                          </span>
                        </span>
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${msg.sender_id === currentUser?.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                  )}
                {msg.sender_id === currentUser?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {currentUserProfile?.first_name ? currentUserProfile.first_name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}
              </>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}