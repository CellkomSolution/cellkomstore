"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DollarSign, ShoppingBag } from "lucide-react";
import { getTotalProductsCount } from "@/lib/supabase/products";
import { getTotalUsersCount } from "@/lib/supabase/profiles";
import { getTotalOrdersCount } from "@/lib/supabase/orders"; // Import getTotalOrdersCount

export default function AdminDashboardPage() {
  const [totalProducts, setTotalProducts] = React.useState<number | null>(null);
  const [totalUsers, setTotalUsers] = React.useState<number | null>(null);
  const [totalOrders, setTotalOrders] = React.useState<number | null>(null); // New state for total orders
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const productsCount = await getTotalProductsCount();
      const usersCount = await getTotalUsersCount();
      const ordersCount = await getTotalOrdersCount(); // Fetch total orders
      setTotalProducts(productsCount);
      setTotalUsers(usersCount);
      setTotalOrders(ordersCount); // Set total orders
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Selamat Datang di Dasbor Admin!</h2>
      <p className="text-muted-foreground">
        Di sini Anda dapat mengelola seluruh konten dan pengaturan aplikasi.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">+10% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">+20% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">+15% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Konten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur manajemen konten akan dibangun di sini. Anda dapat mengelola banner, kategori, produk, dan elemen lainnya.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>- Manajemen Pesanan</li>
            <li>- Manajemen Produk</li>
            <li>- Manajemen Banner</li>
            <li>- Manajemen Kategori</li>
            <li>- Manajemen Metode Pembayaran</li>
            <li>- Pengaturan Header & Footer</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}