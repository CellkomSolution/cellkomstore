"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders, Order } from "@/lib/supabase/orders";
import { Loader2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
      setIsLoading(false);
    }
    fetchOrders();
  }, []);

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
      case 'awaiting_confirmation': return 'info'; // Assuming 'info' variant exists
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

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manajemen Pesanan</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pesanan</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status Pesanan</TableHead>
                  <TableHead>Status Pembayaran</TableHead>
                  <TableHead>Kode Unik</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Belum ada pesanan yang dibuat.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">
                        {order.user_profile?.first_name || order.user_profile?.email || "N/A"}
                      </TableCell>
                      <TableCell>{formatRupiah(order.total_amount + order.payment_unique_code)}</TableCell>
                      <TableCell>
                        <Badge variant={getOrderStatusBadgeVariant(order.order_status)}>
                          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                          {getPaymentStatusText(order.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{order.payment_unique_code}</TableCell>
                      <TableCell>{order.payment_method?.name || "Belum Dipilih"}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "dd MMM yyyy, HH:mm")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Lihat Detail</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}