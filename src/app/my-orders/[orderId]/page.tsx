"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, User as UserIcon, CalendarDays, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getOrderById, Order } from "@/lib/supabase/orders";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useSession } from "@/context/session-context";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default function UserOrderDetailPage({ params }: UserOrderDetailPageProps) {
  const unwrappedParams = React.use(params);
  const { orderId } = unwrappedParams;
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (!user && !isSessionLoading) {
        toast.error("Anda harus login untuk melihat detail pesanan.");
        router.replace("/auth");
        return;
      }

      const fetchedOrder = await getOrderById(orderId);
      if (!fetchedOrder || (user && fetchedOrder.user_id !== user.id)) {
        toast.error("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
        router.replace("/my-orders"); // Redirect to user's order list
        return;
      }
      setOrder(fetchedOrder);
      setIsLoading(false);
    }
    fetchData();
  }, [orderId, user, isSessionLoading, router]);

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading || isSessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Detail Pesanan #{order.id.substring(0, 8)}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Pesanan Saya
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Dibuat pada: {format(new Date(order.created_at), "dd MMMM yyyy, HH:mm")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Produk Dipesan</h3>
              <ScrollArea className="h-64 pr-4">
                <ul className="space-y-4">
                  {order.order_items?.map((item) => (
                    <li key={item.id} className="flex items-center gap-4">
                      <Image
                        src={item.product_image_url_at_purchase}
                        alt={item.product_name_at_purchase}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{item.product_name_at_purchase}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatRupiah(item.price_at_purchase)}
                        </p>
                      </div>
                      <p className="font-semibold text-right">
                        {formatRupiah(item.price_at_purchase * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">Alamat Pengiriman</h3>
              <div className="space-y-1 text-muted-foreground text-sm">
                <p className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> {order.shipping_address_name}</p>
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-1" /> {order.shipping_address_full}, {order.shipping_address_nagari}, {order.shipping_address_kecamatan}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {order.contact_phone}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">Informasi Pelanggan</h3>
              <div className="space-y-1 text-muted-foreground text-sm">
                <p className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> {order.user_profile?.first_name} {order.user_profile?.last_name}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {order.user_profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status Saat Ini:</span>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({order.order_items?.length || 0} item)</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Metode Pembayaran:</span>
                <Badge variant="secondary">
                  {order.payment_method?.name || "Belum Dipilih"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}