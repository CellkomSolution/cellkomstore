"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmailConfirmPage() {
  const router = useRouter();
  const [countdown, setCountdown] = React.useState(5);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/auth"); // Redirect to login page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Email Berhasil Dikonfirmasi!</CardTitle>
          <CardDescription>
            Terima kasih telah mengonfirmasi email Anda. Akun Anda sekarang aktif.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Anda akan diarahkan ke halaman login dalam {countdown} detik.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth">Masuk Sekarang</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}