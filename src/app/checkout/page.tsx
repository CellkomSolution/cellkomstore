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
import { formatRupiah } from "@/lib/utils";
import { useSession } from "@/context/session-context";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { GoogleMapPicker } from "@/components/google-map-picker";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus diisi (min. 2 karakter)." }),
  fullAddress: z.string().min(10, { message: "Alamat lengkap harus diisi (min. 10 karakter)." }),
  city: z.string().min(3, { message: "Kota harus diisi." }),
  postalCode: z.string().optional().nullable(),
  phone: z.string().min(10, { message: "Nomor telepon tidak valid." }).max(15),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  const [mapCenter, setMapCenter] = React.useState<{ lat: number; lng: number }>({
    lat: -6.2088, // Default to Jakarta
    lng: 106.8456,
  });
  const [markerPosition, setMarkerPosition] = React.useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fullAddress: "",
      city: "",
      postalCode: null,
      phone: "",
      latitude: null,
      longitude: null,
    },
  });

  React.useEffect(() => {
    if (!isSessionLoading && !user) {
      toast.error("Anda harus login untuk melanjutkan checkout.");
      router.replace("/auth");
      return;
    }
    if (totalItems === 0) {
      router.replace("/");
    }
  }, [totalItems, router, user, isSessionLoading]);

  const handlePlaceSelect = (place: {
    address: string;
    lat: number;
    lng: number;
    city?: string;
    postalCode?: string;
  }) => {
    form.setValue("fullAddress", place.address, { shouldValidate: true });
    form.setValue("city", place.city || "", { shouldValidate: true });
    form.setValue("postalCode", place.postalCode || null, { shouldValidate: true });
    form.setValue("latitude", place.lat, { shouldValidate: true });
    form.setValue("longitude", place.lng, { shouldValidate: true });
    setMapCenter({ lat: place.lat, lng: place.lng });
    setMarkerPosition({ lat: place.lat, lng: place.lng });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    form.setValue("latitude", lat, { shouldValidate: true });
    form.setValue("longitude", lng, { shouldValidate: true });
    // Optionally, reverse geocode to get address details
    // For simplicity, we'll just update lat/lng here.
    toast.info("Lokasi peta diperbarui. Anda mungkin perlu menyesuaikan alamat lengkap secara manual.");
  };

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

  if (isSessionLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Memuat...</p>
      </div>
    );
  }

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
                    name="fullAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cari Alamat</FormLabel>
                        <FormControl>
                          <AddressAutocompleteInput
                            onPlaceSelect={handlePlaceSelect}
                            defaultValue={field.value}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Mulai ketik alamat Anda dan pilih dari saran.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Jl. Jenderal Sudirman No. 52-53" {...field} />
                        </FormControl>
                        <FormDescription>
                          Pastikan alamat sudah benar dan lengkap.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pos (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} value={field.value ?? ""} />
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
                  <FormItem>
                    <FormLabel>Pilih Lokasi di Peta</FormLabel>
                    <FormControl>
                      <GoogleMapPicker
                        center={mapCenter}
                        markerPosition={markerPosition}
                        onMapClick={handleMapClick}
                        className="h-80"
                      />
                    </FormControl>
                    <FormDescription>
                      Klik pada peta untuk menyesuaikan lokasi pengiriman.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                   <Button type="submit" size="lg" className="w-full mt-6" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Membuat Pesanan..." : "Buat Pesanan"}
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