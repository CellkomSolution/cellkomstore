"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ArrowLeft, User as UserIcon, Package, ReceiptText } from "lucide-react";
import { Profile } from "@/lib/supabase/profiles";
import { Order } from "@/lib/supabase/orders";
import { Product } from "@/lib/supabase/products";
import { formatRupiah } from "@/lib/utils";

interface ChatHeaderProps {
  otherUserProfile: Profile | null;
  currentUserName: string;
  currentUserAvatar: string | undefined;
  orderContext?: Order | null;
  productContext?: Product | null;
  isMobile?: boolean;
  onBackClick?: () => void;
  isAdminView?: boolean; // To differentiate admin view for order links
}

export function ChatHeader({
  otherUserProfile,
  currentUserName,
  currentUserAvatar,
  orderContext,
  productContext,
  isMobile = false,
  onBackClick,
  isAdminView = false,
}: ChatHeaderProps) {
  const otherUserName = otherUserProfile?.first_name || otherUserProfile?.email?.split('@')[0] || "Pengguna";
  const otherUserEmail = otherUserProfile?.email || "N/A";
  const otherUserAvatar = otherUserProfile?.avatar_url || undefined;

  return (
    <div className="flex items-center gap-3 p-4 border-b">
      {isMobile && onBackClick && (
        <Button variant="ghost" size="icon" onClick={onBackClick}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali</span>
        </Button>
      )}
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherUserAvatar} />
        <AvatarFallback>
          {otherUserName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <CardTitle className="text-lg">
          {otherUserName} {otherUserProfile?.last_name || ""}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{otherUserEmail}</p>
        {productContext && (
          <p className="text-xs text-primary mt-1">
            Membahas Produk: <Link href={`/product/${productContext.id}`} className="underline hover:text-primary">{productContext.name}</Link>
          </p>
        )}
        {orderContext && (
          <p className="text-xs text-primary mt-1">
            Membahas Pesanan:{" "}
            <Link
              href={isAdminView ? `/admin/orders/${orderContext.id}` : `/my-orders/${orderContext.id}`}
              className="underline hover:text-primary"
            >
              #{orderContext.id.substring(0, 8)}
            </Link>{" "}
            (Total: {formatRupiah(orderContext.total_amount + orderContext.payment_unique_code)})
            <span className="ml-2 text-xs">
              (Status: {orderContext.order_status}, Pembayaran: {orderContext.payment_status}, Kode Unik: {orderContext.payment_unique_code})
            </span>
          </p>
        )}
      </div>
    </div>
  );
}