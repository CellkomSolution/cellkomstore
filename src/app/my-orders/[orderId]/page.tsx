"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, User as UserIcon, CalendarDays, ArrowLeft, MessageSquare, Banknote, Wallet, CreditCard, Package, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getOrderById, updateOrderPaymentMethodAndStatus, updateOrderStatus, confirmPaymentByUser, Order } from "@/lib/supabase/orders";
import { getPaymentMethods, PaymentMethod } from "@/lib/supabase/payment-methods";
import Image from "next/image";
import { format } from "date-fns";
import { useSession } from "@/context/session-context";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWidget } from "@/components/chat-widget";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createNotification } from "@/lib/supabase/notifications"; // Import createNotification

interface UserOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default function UserOrderDetailPage({ params }: UserOrderDetailPageProps) {
  const { orderId } = React.use(params);
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();
  const { clearCart } = useCart();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = React.useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = React.useState(false);
  const [isUserConfirmingPayment, setIsUserConfirmingPayment] = React.useState(false); // New state for user payment confirmation

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    if (!user && !isSessionLoading) {
      toast.error("Anda harus login untuk melihat detail pesanan Anda.");
      router.replace("/auth");
      return;
    }

    const fetchedOrder = await getOrderById(orderId);
    if (!fetchedOrder || (user && fetchedOrder.user_id !== user.id)) {
      toast.error("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
      router.replace("/my-orders");
      return;
    }
    setOrder(fetchedOrder);

    if (fetchedOrder.payment_status === 'unpaid' || fetchedOrder.payment_status === 'awaiting_confirmation') {
      const activeMethods = await getPaymentMethods(true);
      setPaymentMethods(activeMethods);
      if (activeMethods.length === 1) {
        setSelectedPaymentMethodId(activeMethods[0].id);
      } else if (fetchedOrder.payment_method_id) {
        setSelectedPaymentMethodId(fetchedOrder.payment_method_id);
      }
    }
    setIsLoading(false);
  }, [orderId, user, isSessionLoading, router]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmPaymentMethod = async () => {
    if (!order || !selectedPaymentMethodId) {
      toast.error("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }
    setIsConfirmingPayment(true);
    try {
      await updateOrderPaymentMethodAndStatus(order.id, selectedPaymentMethodId);
      clearCart(); // Clear cart after payment method is selected and confirmed
      toast.success("Metode pembayaran berhasil dipilih! Mohon lakukan pembayaran.");
      
      // Send notification to the buyer
      if (order.user_id) {
        await createNotification({
          user_id: order.user_id,
          title: "Metode Pembayaran Dipilih",
          message: `Anda telah memilih metode pembayaran untuk pesanan #${order.id.substring(0, 8)}. Menunggu konfirmasi dari penjual.`,
          link: `/my-orders/${order.id}`,
          is_read: false,
        });
      }

      await fetchData(); // Refetch to update UI with new payment status
    } catch (error: any) {
      console.error("Error confirming payment method:", error);
      toast.error(error.message || "Gagal mengonfirmasi metode pembayaran.");
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleUserConfirmPayment = async () => {
    if (!order || !user) return;
    setIsUserConfirmingPayment(true);
    try {
      await confirmPaymentByUser(order.id, user.id);
      toast.success("Pembayaran Anda telah dikonfirmasi. Pesanan Anda sedang diproses.");
      await fetchData(); // Refetch to update UI
    } catch (error: any) {
      console.error("Error user confirming payment:", error);
      toast.error(error.message || "Gagal mengonfirmasi pembayaran.");
    } finally {
      setIsUserConfirmingPayment(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancellingOrder(true);
    try {
      // Update order status to 'cancelled' and payment status to 'refunded'
      await updateOrderStatus(order.id, 'cancelled', 'refunded');
      toast.success("Pesanan berhasil dibatalkan.");

      // Send notification to the buyer
      if (order.user_id) {
        await createNotification({
          user_id: order.user_id,
          title: "Pesanan Dibatalkan",
          message: `Pesanan #${order.id.substring(0, 8)} Anda telah berhasil dibatalkan.`,
          link: `/my-orders/${order.id}`,
          is_read: false,
        });
      }

      await fetchData(); // Refetch to update UI
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Gagal membatalkan pesanan.");
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const handleContinueShopping = () => {
    clearCart(); // Clear cart before redirecting to shopping
    router.push("/");
  };

  const getStatusBadgeVariant = (orderStatus: Order['order_status'], paymentStatus: Order['payment_status']) => {
    if (paymentStatus === 'unpaid') return 'secondary';
    if (paymentStatus === 'awaiting_confirmation') return 'info';
    if (paymentStatus === 'paid') return 'success';
    if (paymentStatus === 'refunded') return 'destructive';

    switch (orderStatus) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusText = (paymentStatus: Order['payment_status']) => {
    switch (paymentStatus) {
      case 'unpaid': return 'Belum Dibayar';
      case 'awaiting_confirmation': return 'Menunggu Konfirmasi Pembayaran';
      case 'paid': return 'Sudah Dibayar';
      case 'refunded': return 'Dikembalikan';
      default: return 'Tidak Diketahui';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.image_url) {
      return (
        <Image
          src={method.image_url}
          alt={method.name}
          width={32}
          height={32}
          className="object-contain rounded"
        />
      );
    }
    switch (method.type) {
      case 'bank_transfer': return <Banknote className="h-5 w-5 text-muted-foreground" />;
      case 'e_wallet': return <Wallet className="h-5 w-5 text-muted-foreground" />;
      case 'card': return <CreditCard className="h-5 w-5 text-muted-foreground" />;
      default: return <Banknote className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getDetailsDisplay = (method: PaymentMethod) => {
    if (!method.details) return "N/A";

    if (method.type === 'bank_transfer' && typeof method.details === 'object') {
      return (
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Bank:</span> {method.details.bank_name}</p>
          <p><span className="font-medium">A/N:</span> {method.details.account_name}</p>
          <p><span className="font-medium">No. Rek:</span> {method.details.account_number}</p>
        </div>
      );
    }
    if (method.type === 'e_wallet' && typeof method.details === 'object') {
      return (
        <div className="text-sm space-y-1">
          <p><span className="font-medium">E-Wallet:</span> {method.details.e_wallet_name}</p>
          <p><span className="font-medium">ID:</span> {method.details.phone_number_or_id}</p>
        </div>
      );
    }
    if (method.type === 'card' && typeof method.details === 'object') {
      return (
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Tipe:</span> {method.details.card_type}</p>
          {method.details.last_four_digits && <p><span className="font-medium">No. Kartu:</span> **** {method.details.last_four_digits}</p>}
        </div>
      );
    }
    // Fallback for 'other' type or malformed JSON
    return typeof method.details === 'string' ? method.details : JSON.stringify(method.details, null, 2);
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

  // Determine if the order is cancellable
  const isCancellable = order && (order.order_status === 'pending' || order.order_status === 'awaiting_confirmation');

  if (isLoading || isSessionLoading) {
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
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Detail Pesanan #{order.id.substring(0, 8)}</h1>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Pesanan Saya
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status & Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Status Pesanan:</span>
                  <Badge variant={getStatusBadgeVariant(order.order_status, order.payment_status)}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">Status Pembayaran:</span>
                  <Badge variant={getStatusBadgeVariant(order.order_status, order.payment_status)}>
                    {getPaymentStatusText(order.payment_status)}
                  </Badge>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(order.total_amount + order.payment_unique_code)}</span>
                </div>
                {order.payment_status === 'unpaid' && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <ReceiptText className="h-4 w-4" />
                    <span>Kode Unik Pembayaran: <span className="font-semibold text-primary">{order.payment_unique_code}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>

            {order.payment_status === 'unpaid' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pilih Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup onValueChange={setSelectedPaymentMethodId} value={selectedPaymentMethodId || undefined}>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <Label key={method.id} htmlFor={method.id} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-primary">
                          <RadioGroupItem value={method.id} id={method.id} />
                          {getMethodIcon(method)}
                          <span>{method.name}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                  {selectedPaymentMethod && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md border">
                      <h4 className="font-semibold mb-2">Instruksi Pembayaran</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Mohon transfer sebesar <span className="font-bold text-primary">{formatRupiah(order.total_amount + order.payment_unique_code)}</span> ke rekening/e-wallet berikut, termasuk kode unik <span className="font-bold text-primary">{order.payment_unique_code}</span>.
                      </p>
                      {getDetailsDisplay(selectedPaymentMethod)}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleConfirmPaymentMethod} disabled={!selectedPaymentMethodId || isConfirmingPayment}>
                    {isConfirmingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Konfirmasi Metode Pembayaran
                  </Button>
                </CardFooter>
              </Card>
            )}

            {order.payment_status === 'awaiting_confirmation' && order.payment_method && (
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    {order.payment_method.image_url && (
                      <Image
                        src={order.payment_method.image_url}
                        alt={order.payment_method.name}
                        width={40}
                        height={40}
                        className="object-contain rounded"
                      />
                    )}
                    <p className="font-semibold text-lg">{order.payment_method.name}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md border">
                    <h4 className="font-semibold mb-2">Instruksi Pembayaran</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Total yang harus dibayar: <span className="font-bold text-primary">{formatRupiah(order.total_amount + order.payment_unique_code)}</span> (termasuk kode unik <span className="font-bold text-primary">{order.payment_unique_code}</span>).
                    </p>
                    {getDetailsDisplay(order.payment_method)}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleUserConfirmPayment} disabled={isUserConfirmingPayment}>
                    {isUserConfirmingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Saya Sudah Membayar
                  </Button>
                </CardFooter>
              </Card>
            )}

            {(order.payment_status === 'paid' || order.payment_status === 'refunded') && order.payment_method && (
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    {order.payment_method.image_url && (
                      <Image
                        src={order.payment_method.image_url}
                        alt={order.payment_method.name}
                        width={40}
                        height={40}
                        className="object-contain rounded"
                      />
                    )}
                    <p className="font-semibold text-lg">{order.payment_method.name}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md border">
                    <h4 className="font-semibold mb-2">Instruksi Pembayaran</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Total yang harus dibayar: <span className="font-bold text-primary">{formatRupiah(order.total_amount + order.payment_unique_code)}</span> (termasuk kode unik <span className="font-bold text-primary">{order.payment_unique_code}</span>).
                    </p>
                    {getDetailsDisplay(order.payment_method)}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" className="w-full" onClick={() => setIsChatOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Hubungi Penjual
            </Button>

            <Button variant="secondary" className="w-full" onClick={handleContinueShopping}>
              Tambah Pesanan
            </Button>

            {isCancellable && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isCancellingOrder}>
                    {isCancellingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Batalkan Pesanan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin ingin membatalkan pesanan ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Pesanan Anda akan dibatalkan dan pembayaran (jika sudah dilakukan) akan diproses untuk pengembalian dana.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancellingOrder}>Tidak</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelOrder} disabled={isCancellingOrder}>
                      {isCancellingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Ya, Batalkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
      <ChatWidget
        productId={null}
        productName={null}
        orderId={order.id}
        orderName={`Pesanan #${order.id.substring(0, 8)}`}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
}