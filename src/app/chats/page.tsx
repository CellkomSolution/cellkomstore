"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Laptop } from "lucide-react"; // Menggunakan Laptop untuk ilustrasi
import Image from "next/image";

export default function AdminChatsPage() {
  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Laptop className="h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-2">Selamat Datang di Fitur Chat Admin</h2>
        <p className="text-muted-foreground max-w-md">
          Pilih salah satu percakapan dari daftar di sebelah kiri untuk mulai membalas pesan dari pelanggan Anda.
        </p>
      </CardContent>
    </Card>
  );
}