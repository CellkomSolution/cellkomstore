"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingBag, Package, CalendarDays, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getUserOrders, Order } from "@/lib/supabase/orders";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useSession } from "@/context/session-context";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MyOrdersPage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (!user && !isSessionLoading) {
        toast.error("Anda harus login untuk melihat pesanan Anda.");
        router.replace("/auth");
        return;
      }
      if (user) {
        const fetchedOrders = await getUserOrders(user.id);
        setOrders(fetchedOrders);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [user, isSessionLoading, router]);

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Memuat pesanan Anda...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pesanan Saya</h1>

      {orders.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">Anda belum memiliki pesanan.</h2>
            <p className="text-muted-foreground">
              Mulai jelajahi produk kami dan buat pesanan pertama Anda!
            </p>
            <Button asChild>
              <Link href="/">Mulai Belanja</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pesanan #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    {format(new Date(order.created_at), "dd MMMM yyyy, HH:mm")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/my-orders/${order.id}`}> {/* Updated link */}
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Lihat Detail</span>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Produk</h3>
                    <ScrollArea className="h-32 pr-4">
                      <ul className="space-y-2">
                        {order.order_items?.map((item) => (
                          <li key={item.id} className="flex items-center gap-3">
                            {item.product_image_url_at_purchase ? (
                              <Image
                                src={item.product_image_url_at_purchase}
                                alt={item.product_name_at_purchase}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                No Img
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm line-clamp-1">{item.product_name_at_purchase}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} x {formatRupiah(item.price_at_purchase)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ringkasan</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Item:</span>
                        <span>{order.order_items?.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Pembayaran:</span>
                        <span>{formatRupiah(order.total_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Metode Pembayaran:</span>
                        <span>{order.payment_method?.name || "Belum Dipilih"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}