"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, User as UserIcon, Package, CalendarDays, MessageSquare, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getOrderById, updateOrderStatus, Order } from "@/lib/supabase/orders";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createNotification } from "@/lib/supabase/notifications"; // Import createNotification

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id: orderId } = React.use(params);
  const router = useRouter();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const fetchedOrder = await getOrderById(orderId);
      if (!fetchedOrder) {
        toast.error("Pesanan tidak ditemukan.");
        router.replace("/admin/orders");
        return;
      }
      setOrder(fetchedOrder);
      setIsLoading(false);
    }
    fetchData();
  }, [orderId, router]);

  const getOrderStatusDisplayText = (status: Order['order_status']) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'processing': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Tidak Diketahui';
    }
  };

  const handleStatusChange = async (newStatus: Order['order_status']) => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      let updatedOrder: Order | null = null;
      let notificationTitle = "";
      let notificationMessage = "";

      if (order.payment_status === 'awaiting_confirmation' && newStatus === 'processing') {
        // Admin confirms payment
        updatedOrder = await updateOrderStatus(order.id, newStatus, 'paid');
        notificationTitle = "Pembayaran Dikonfirmasi!";
        notificationMessage = `Pembayaran untuk pesanan #${order.id.substring(0, 8)} Anda telah dikonfirmasi. Pesanan Anda sekarang sedang diproses.`;
        toast.success(`Pembayaran dikonfirmasi! Status pesanan diubah menjadi ${getOrderStatusDisplayText(newStatus)}.`);
      } else {
        // Regular order status update
        updatedOrder = await updateOrderStatus(order.id, newStatus);
        notificationTitle = "Status Pesanan Diperbarui";
        notificationMessage = `Status pesanan #${order.id.substring(0, 8)} Anda telah diperbarui menjadi ${getOrderStatusDisplayText(newStatus)}.`;
        toast.success(`Status pesanan berhasil diperbarui menjadi ${getOrderStatusDisplayText(newStatus)}.`);
      }
      
      setOrder(updatedOrder);

      // Send notification to the buyer
      if (updatedOrder && updatedOrder.user_id) {
        await createNotification({
          user_id: updatedOrder.user_id,
          title: notificationTitle,
          message: notificationMessage,
          link: `/my-orders/${updatedOrder.id}`,
          is_read: false,
        });
      }

    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Gagal memperbarui status pesanan.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getOrderStatusBadgeVariant = (status: Order['order_status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: Order['payment_status']) => {
    switch (status) {
      case 'unpaid': return 'secondary';
      case 'awaiting_confirmation': return 'info';
      case 'paid': return 'success';
      case 'refunded': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusText = (status: Order['payment_status']) => {
    switch (status) {
      case 'unpaid': return 'Belum Dibayar';
      case 'awaiting_confirmation': return 'Menunggu Konfirmasi';
      case 'paid': return 'Sudah Dibayar';
      case 'refunded': return 'Dikembalikan';
      default: return 'Tidak Diketahui';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detail Pesanan #{order.id.substring(0, 8)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Kembali ke Daftar Pesanan
          </Button>
          {order.user_profile?.id && (
            <Button asChild>
              <Link href={`/chats/${order.user_profile.id}?orderId=${order.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat dengan Pelanggan
              </Link>
            </Button>
          )}
        </div>
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
                      {item.product_image_url_at_purchase ? (
                        <Image
                          src={item.product_image_url_at_purchase}
                          alt={item.product_name_at_purchase}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          No Img
                        </div>
                      )}
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
              <CardTitle>Status Pesanan & Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status Pesanan:</span>
                <Badge variant={getOrderStatusBadgeVariant(order.order_status)}>
                  {getOrderStatusDisplayText(order.order_status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status Pembayaran:</span>
                <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                  {getPaymentStatusText(order.payment_status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ReceiptText className="h-4 w-4" />
                <span>Kode Unik Pembayaran: <span className="font-semibold text-primary">{order.payment_unique_code}</span></span>
              </div>
              
              {order.payment_status === 'awaiting_confirmation' && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pembeli telah memilih metode pembayaran dan menunggu konfirmasi Anda.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => handleStatusChange('processing')} 
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Konfirmasi Pembayaran & Proses Pesanan
                  </Button>
                </div>
              )}

              {order.payment_status === 'paid' && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pembayaran telah dikonfirmasi. Anda dapat mengubah status pesanan.
                  </p>
                  <Select
                    value={order.order_status}
                    onValueChange={(value: Order['order_status']) => handleStatusChange(value)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ubah Status Pesanan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-2" />}
                </div>
              )}

              {order.payment_status === 'unpaid' && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Pembeli belum memilih metode pembayaran.
                  </p>
                </div>
              )}
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
                <span>Kode Unik Pembayaran</span>
                <span>{order.payment_unique_code}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.total_amount + order.payment_unique_code)}</span>
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