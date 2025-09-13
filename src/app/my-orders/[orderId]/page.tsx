"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, User as UserIcon, CalendarDays, ArrowLeft, MessageSquare, Banknote, Wallet, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getOrderById, updateOrderPaymentMethod, Order } from "@/lib/supabase/orders";
import { getPaymentMethods, PaymentMethod } from "@/lib/supabase/payment-methods";
import Image from "next/image";
import { format } from "date-fns";
import { useSession } from "@/context/session-context";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWidget } from "@/components/chat-widget";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart-context"; // Import useCart to clear cart

interface UserOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default function UserOrderDetailPage({ params }: UserOrderDetailPageProps) {
  const unwrappedParams = React.use(params);
  const { orderId } = unwrappedParams;
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();
  const { clearCart } = useCart(); // Get clearCart from context

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    if (!user && !isSessionLoading) {
      toast.error("Anda harus login untuk melihat detail pesanan.");
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

    if (fetchedOrder.status === 'pending') {
      const activeMethods = await getPaymentMethods(true);
      setPaymentMethods(activeMethods);
      // Pre-select if there's only one active method or if one was already chosen
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

  const handleConfirmPayment = async () => {
    if (!order || !selectedPaymentMethodId) {
      toast.error("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }
    setIsConfirmingPayment(true);
    try {
      await updateOrderPaymentMethod(order.id, selectedPaymentMethodId);
      clearCart(); // Clear cart after payment confirmation
      toast.success("Metode pembayaran berhasil dikonfirmasi!");
      await fetchData(); // Refetch order data to update UI
    } catch (error: any) {
      console.error("Error confirming payment method:", error);
      toast.error(error.message || "Gagal mengonfirmasi pembayaran.");
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'bank_transfer': return <Banknote className="h-5 w-5 text-muted-foreground" />;
      case 'e_wallet': return <Wallet className="h-5 w-5 text-muted-foreground" />;
      case 'card': return <CreditCard className="h-5 w-5 text-muted-foreground" />;
      default: return <Banknote className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status & Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {order.status === 'pending' && (
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
                          {getMethodIcon(method.type)}
                          <span>{method.name}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                  {selectedPaymentMethod && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md border">
                      <h4 className="font-semibold mb-2">Instruksi Pembayaran</h4>
                      <pre className="text-sm whitespace-pre-wrap font-sans">{JSON.stringify(selectedPaymentMethod.details, null, 2)}</pre>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleConfirmPayment} disabled={!selectedPaymentMethodId || isConfirmingPayment}>
                    {isConfirmingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Konfirmasi Pembayaran
                  </Button>
                </CardFooter>
              </Card>
            )}

            {order.status !== 'pending' && order.payment_method && (
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">{order.payment_method.name}</p>
                  <div className="p-3 bg-muted/50 rounded-md border">
                    <h4 className="font-semibold mb-2">Instruksi Pembayaran</h4>
                    <pre className="text-sm whitespace-pre-wrap font-sans">{JSON.stringify(order.payment_method.details, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" className="w-full" onClick={() => setIsChatOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Hubungi Penjual
            </Button>
          </div>
        </div>
      </div>
      <ChatWidget
        productId={null}
        productName={`Pesanan #${order.id.substring(0, 8)}`}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
}