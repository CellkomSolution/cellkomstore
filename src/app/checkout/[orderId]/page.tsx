"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, Banknote, CreditCard, Wallet, MapPin, Phone, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getOrderById, updateOrderPaymentMethod, Order } from "@/lib/supabase/orders";
import { getPaymentMethods, PaymentMethod } from "@/lib/supabase/payment-methods";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/context/session-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const unwrappedParams = React.use(params);
  const { orderId } = unwrappedParams;
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = React.useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string | null>(null);

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
        router.replace("/");
        return;
      }
      setOrder(fetchedOrder);
      setSelectedPaymentMethodId(fetchedOrder.payment_method_id);

      const activePaymentMethods = await getPaymentMethods(true);
      setPaymentMethods(activePaymentMethods);
      setIsLoading(false);
    }
    fetchData();
  }, [orderId, user, isSessionLoading, router]);

  const handleSelectPaymentMethod = async () => {
    if (!selectedPaymentMethodId || !order) {
      toast.error("Silakan pilih metode pembayaran.");
      return;
    }
    setIsSubmittingPayment(true);
    try {
      await updateOrderPaymentMethod(order.id, selectedPaymentMethodId);
      toast.success("Metode pembayaran berhasil diperbarui!");
      // Refetch order to show updated payment method
      const updatedOrder = await getOrderById(order.id);
      setOrder(updatedOrder);
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      toast.error(error.message || "Gagal memperbarui metode pembayaran.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'bank_transfer': return <Banknote className="h-5 w-5 text-muted-foreground" />;
      case 'e_wallet': return <Wallet className="h-5 w-5 text-muted-foreground" />;
      case 'card': return <CreditCard className="h-5 w-5 text-muted-foreground" />;
      default: return <Banknote className="h-5 w-5 text-muted-foreground" />;
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

  const selectedMethodDetails = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Pesanan Berhasil Dibuat!</h1>
        <p className="text-muted-foreground">ID Pesanan Anda: <span className="font-mono">{order.id}</span></p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
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
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-1" /> {order.shipping_address_full}, {order.shipping_address_city} {order.shipping_address_postal_code}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {order.contact_phone}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">Metode Pembayaran</h3>
              {order.payment_method ? (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                  {getPaymentMethodIcon(order.payment_method.type as PaymentMethod['type'])}
                  <span className="font-medium">{order.payment_method.name}</span>
                  <Badge variant="secondary" className="ml-auto">{order.status}</Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">Belum ada metode pembayaran yang dipilih.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button asChild>
              <Link href="/">Selesai</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({order.order_items?.length || 0} item)</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(0)}</span> {/* Placeholder for shipping cost */}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="font-semibold text-lg mb-3">Pilih Metode Pembayaran</h3>
            {order.payment_method ? (
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Metode pembayaran sudah dipilih:</p>
                <p className="font-bold text-primary">{order.payment_method.name}</p>
                <div className="mt-4 p-4 border rounded-md bg-secondary text-sm text-left">
                  <h4 className="font-semibold mb-2">Instruksi Pembayaran:</h4>
                  {order.payment_method.details && (
                    typeof order.payment_method.details === 'string' ? (
                      <p>{order.payment_method.details}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(order.payment_method.details, null, 2)}</pre>
                    )
                  )}
                  {!order.payment_method.details && <p>Tidak ada instruksi pembayaran yang tersedia.</p>}
                </div>
              </div>
            ) : (
              <RadioGroup
                value={selectedPaymentMethodId || undefined}
                onValueChange={setSelectedPaymentMethodId}
                className="space-y-3"
                disabled={isSubmittingPayment}
              >
                {paymentMethods.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Tidak ada metode pembayaran yang tersedia.</p>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50">
                      <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                      <Label htmlFor={`method-${method.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                        {getPaymentMethodIcon(method.type)}
                        <span className="font-medium">{method.name}</span>
                      </Label>
                    </div>
                  ))
                )}
              </RadioGroup>
            )}
          </CardContent>
          {!order.payment_method && (
            <CardFooter>
              <Button
                onClick={handleSelectPaymentMethod}
                className="w-full"
                disabled={!selectedPaymentMethodId || isSubmittingPayment}
              >
                {isSubmittingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memilih...
                  </>
                ) : (
                  "Pilih Metode Pembayaran"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}