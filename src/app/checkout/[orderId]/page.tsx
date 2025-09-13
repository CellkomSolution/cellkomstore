"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getOrderById, Order } from "@/lib/supabase/orders";
import Link from "next/link";
import { useSession } from "@/context/session-context";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
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
        router.replace("/");
        return;
      }
      setOrder(fetchedOrder);
      setIsLoading(false);
    }
    fetchData();
  }, [orderId, user, isSessionLoading, router]);

  if (isLoading || isSessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Memuat konfirmasi pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Pesanan Berhasil Dibuat!</CardTitle>
          <p className="text-muted-foreground">
            Terima kasih telah berbelanja. ID Pesanan Anda: <span className="font-mono">{order.id.substring(0, 8)}</span>
          </p>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Pembayaran:</span>
              <span className="font-bold">{formatRupiah(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold capitalize">{order.status}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Silakan lanjutkan ke halaman detail pesanan untuk memilih metode pembayaran dan melihat instruksi lebih lanjut.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="w-full">
            <Link href={`/my-orders/${order.id}`}>Lihat Detail Pesanan</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Lanjutkan Belanja
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}