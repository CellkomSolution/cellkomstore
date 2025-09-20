"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const signupFormSchema = z.object({
  email: z.string().email({ message: "Email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
});

interface OtpSignupFormProps {
  onSwitchToSignIn: () => void;
}

export function OtpSignupForm({ onSwitchToSignIn }: OtpSignupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        password: values.password, // Password is required for `shouldCreateUser` with email channel
        options: {
          shouldCreateUser: true,
          channel: "email",
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Kode OTP telah dikirim ke email Anda. Silakan verifikasi.");
      router.push(`/auth/otp-verify?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      toast.error("Pendaftaran gagal: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nama@contoh.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buat Kata Sandi</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Daftar
        </Button>
      </form>
      <p className="text-sm text-center text-gray-500 mt-4">
        Sudah punya akun?{" "}
        <Button variant="link" onClick={onSwitchToSignIn} className="p-0 h-auto">
          Masuk
        </Button>
      </p>
    </Form>
  );
}