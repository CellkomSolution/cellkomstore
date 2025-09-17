"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DollarSign, ShoppingBag, LayoutGrid, Image as ImageIcon, CreditCard, Settings, BookOpen, MessageSquare, LayoutDashboard } from "lucide-react"; // Removed ImageStack
import { getTotalProductsCount } from "@/lib/supabase/products";
import { getTotalUsersCount } from "@/lib/supabase/profiles";
import { getTotalOrdersCount } from "@/lib/supabase/orders"; // Import getTotalOrdersCount
import Link from "next/link"; // Import Link

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
        <Link href="/admin/orders" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : totalOrders}
              </div>
              {/* <p className="text-xs text-muted-foreground">+10% dari bulan lalu</p> */}
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : totalProducts}
              </div>
              {/* <p className="text-xs text-muted-foreground">+20% dari bulan lalu</p> */}
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : totalUsers}
              </div>
              {/* <p className="text-xs text-muted-foreground">+15% dari bulan lalu</p> */}
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Konten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gunakan tautan di bawah ini untuk mengelola berbagai aspek aplikasi Anda.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/admin/orders" className="flex items-center gap-2 hover:text-primary">
                <ShoppingBag className="h-4 w-4" /> Manajemen Pesanan
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="flex items-center gap-2 hover:text-primary">
                <Package className="h-4 w-4" /> Manajemen Produk
              </Link>
            </li>
            {/* Removed Hero Carousel link */}
            <li>
              <Link href="/admin/categories" className="flex items-center gap-2 hover:text-primary">
                <LayoutGrid className="h-4 w-4" /> Manajemen Kategori
              </Link>
            </li>
            <li>
              <Link href="/admin/featured-brands" className="flex items-center gap-2 hover:text-primary">
                <ImageIcon className="mr-2 h-4 w-4" />
                Merek Unggulan
              </Link>
            </li>
            <li>
              <Link href="/admin/blog" className="flex items-center gap-2 hover:text-primary">
                <BookOpen className="h-4 w-4" />
                Blog
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="flex items-center gap-2 hover:text-primary">
                <Users className="h-4 w-4" />
                Pengguna
              </Link>
            </li>
            <li>
              <Link href="/admin/payment-methods" className="flex items-center gap-2 hover:text-primary">
                <CreditCard className="h-4 w-4" />
                Metode Pembayaran
              </Link>
            </li>
            <li>
              <Link href="/chats" className="flex items-center gap-2 hover:text-primary">
                <MessageSquare className="h-4 w-4" />
                Chat Admin
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center gap-2 hover:text-primary">
                <Settings className="h-4 w-4" />
                Pengaturan Aplikasi
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}