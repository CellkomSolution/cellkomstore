"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Pengaturan Admin</h2>
      <p className="text-muted-foreground">
        Kelola pengaturan umum aplikasi Anda di sini.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur pengaturan akan ditambahkan di sini. Ini bisa mencakup pengaturan situs, integrasi, dll.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>- Nama Situs</li>
            <li>- Logo</li>
            <li>- Integrasi API</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}