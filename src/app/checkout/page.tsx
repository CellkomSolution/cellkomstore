"use client";

import * as React from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus diisi (min. 2 karakter)." }),
  address: z.string().min(10, { message: "Alamat harus diisi (min. 10 karakter)." }),
  city: z.string().min(3, { message: "Kota harus diisi." }),
  phone: z.string().min(10, { message: "Nomor telepon tidak valid." }).max(15),
});

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (totalItems === 0) {
      router.replace("/");
    }
  }, [totalItems, router]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Order submitted:", values);
    toast.success("Pesanan berhasil dibuat!");
    clearCart();
    router.push("/");
  }

  const handleCancelOrder = () => {
    clearCart();
    toast.info("Pesanan Anda telah dibatalkan.");
    router.push("/");
  };

  if (totalItems === 0) {
    return (
       <div className="container mx-auto px-4 py-8 text-center">
         <h1 className="text-2xl font-bold">Keranjang Anda Kosong</h1>
         <p className="text-muted-foreground mt-2">Sepertinya Anda belum menambahkan produk apapun.</p>
         <Button asChild className="mt-4">
           <Link href="/">Kembali Belanja</Link>
         </Button>
       </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Alamat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Input placeholder="Jl. Jenderal Sudirman No. 52-53" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota</FormLabel>
                          <FormControl>
                            <Input placeholder="Jakarta" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="081234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <Button type="submit" size="lg" className="w-full mt-6">
                    Buat Pesanan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-right shrink-0 ml-4">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Tambah Pesanan</Link>
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleCancelOrder}>
                Batalkan Pesanan
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}