"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Selamat Datang di Dasbor Admin!</h2>
      <p className="text-muted-foreground">
        Di sini Anda dapat mengelola seluruh konten dan pengaturan aplikasi.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">+15% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 12.500.000</div>
            <p className="text-xs text-muted-foreground">+5% dari kemarin</p>
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
            <li>- Manajemen Banner</li>
            <li>- Manajemen Kategori</li>
            <li>- Manajemen Produk</li>
            <li>- Pengaturan Header & Footer</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}