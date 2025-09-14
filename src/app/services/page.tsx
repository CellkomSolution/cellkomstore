"use client";

import * as React from "react";
import { Wrench, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Layanan Servis Kami</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Kami menyediakan berbagai layanan servis untuk produk elektronik dan gadget Anda.
        Percayakan perbaikan perangkat Anda kepada teknisi ahli kami.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Perbaikan Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Layanan perbaikan ekspres untuk masalah umum perangkat Anda.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Dukungan Online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Konsultasi dan dukungan teknis melalui chat atau telepon.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Lokasi Servis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Temukan pusat servis terdekat kami untuk penanganan langsung.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Siap Membantu Anda!</h2>
        <p className="text-muted-foreground mb-6">
          Jangan ragu untuk menghubungi kami jika Anda membutuhkan bantuan.
        </p>
        <Button asChild size="lg">
          <Link href="/contact">Hubungi Kami</Link>
        </Button>
      </div>
    </div>
  );
}