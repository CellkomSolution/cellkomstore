"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSession } from "@/context/session-context";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const otpFormSchema = z.object({
  otp: z.string().min(6, { message: "Kode OTP harus 6 digit." }),
});

export default function OtpVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { session, isLoading: isSessionLoading } = useSession();
  const { theme } = useTheme();

  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  React.useEffect(() => {
    if (!isSessionLoading && session) {
      router.push("/"); // Redirect authenticated users to home
    }
    if (!isSessionLoading && !session && !email) {
      toast.error("Email tidak ditemukan. Silakan daftar ulang.");
      router.replace("/auth"); // Redirect if no email in query
    }
  }, [session, isSessionLoading, email, router]);

  const onSubmit = async (values: z.infer<typeof otpFormSchema>) => {
    if (!email) {
      toast.error("Email tidak ditemukan. Silakan daftar ulang.");
      router.replace("/auth");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: values.otp,
        type: "email",
      });

      if (error) {
        throw error;
      }

      toast.success("Verifikasi berhasil! Anda sekarang masuk.");
      router.push("/"); // Redirect to home after successful verification
    } catch (error: any) {
      toast.error("Verifikasi gagal: " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email tidak ditemukan. Silakan daftar ulang.");
      router.replace("/auth");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          channel: "email",
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Kode OTP baru telah dikirim ke email Anda.");
    } catch (error: any) {
      toast.error("Gagal mengirim ulang OTP: " + error.message);
    } finally {
      setIsResending(false);
    }
  };

  if (isSessionLoading || session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  if (!email) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verifikasi Email Anda</CardTitle>
          <CardDescription>
            Kami telah mengirimkan kode OTP 6 digit ke <span className="font-medium text-foreground">{email}</span>.
            Silakan masukkan kode tersebut di bawah ini untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Kode OTP</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Masukkan kode verifikasi yang dikirim ke email Anda.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verifikasi
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Tidak menerima kode?{" "}
            <Button variant="link" onClick={handleResendOtp} disabled={isResending} className="p-0 h-auto">
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kirim ulang
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/auth" className="underline hover:text-primary">
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}