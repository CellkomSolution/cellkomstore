"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Separator } from "./ui/separator";
import Image from "next/image";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function CartSheet() {
  const { items, totalItems, totalPrice, removeItem } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Keranjang Belanja</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja ({totalItems})</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center py-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <SheetFooter className="mt-4">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatRupiah(totalPrice)}</span>
                    </div>
                    <Button size="lg" className="w-full">Checkout</Button>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="font-semibold">Keranjang Anda kosong</p>
            <p className="text-sm text-muted-foreground">
              Ayo tambahkan beberapa produk!
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}