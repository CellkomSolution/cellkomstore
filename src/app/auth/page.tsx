"use client";

import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/context/session-context";
import Image from "next/image";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && session) {
      router.push("/"); // Redirect to home if already logged in
    }
  }, [session, isLoading, router]);

  if (isLoading || session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1920&auto=format&fit=crop"
        alt="Tech background"
        layout="fill"
        objectFit="cover"
        className="-z-10 brightness-50"
      />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg sm:p-8">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image 
              src="/teslogocellkom.png" 
              alt="Cellkom Store Logo" 
              width={150}
              height={38}
              className="h-auto inline-block invert brightness-0" // Invert for dark background
            />
          </Link>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-1 text-white">Selamat Datang</h2>
        <p className="text-sm text-center text-gray-300 mb-8">Masuk atau daftar untuk melanjutkan</p>
        
        <Auth
          supabaseClient={supabase}
          providers={['google', 'apple']}
          socialLayout="horizontal"
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                  defaultButtonBackground: '#ffffff',
                  defaultButtonBackgroundHover: '#f2f2f2',
                  defaultButtonBorder: '#e6e6e6',
                  defaultButtonText: '#333333',
                  inputText: '#ffffff',
                  inputLabelText: '#a1a1aa', // zinc-400
                  inputBorder: '#52525b', // zinc-600
                  inputPlaceholder: '#71717a', // zinc-500
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  anchorTextColor: '#d4d4d8', // zinc-300
                  anchorTextColorHover: '#ffffff',
                },
                radii: {
                  borderRadius: 'var(--radius)',
                  buttonBorderRadius: 'var(--radius)',
                },
              },
            },
            className: {
              button: 'py-2.5 text-sm',
              input: 'py-2.5 text-sm',
              label: 'text-sm !text-gray-300',
              anchor: 'text-sm',
              container: '!gap-y-4',
              message: '!text-sm !text-red-400'
            },
          }}
          theme="dark" // Force dark theme for better contrast on image
          localization={{
            variables: {
              sign_in: {
                email_label: 'Nomor HP atau email',
                password_label: 'Kata Sandi',
                button_label: 'Masuk',
                social_provider_text: 'Masuk lebih cepat dengan',
                link_text: 'Belum punya akun? Daftar, yuk!',
              },
              sign_up: {
                email_label: 'Nomor HP atau email',
                password_label: 'Buat Kata Sandi',
                button_label: 'Daftar',
                link_text: 'Sudah punya akun? Masuk',
                social_provider_text: 'Daftar lebih cepat dengan',
              },
            },
          }}
          redirectTo={typeof window !== 'undefined' ? window.location.origin : undefined}
        />
        
        <p className="text-xs text-center text-gray-400 mt-8">
          Dengan log in, kamu menyetujui{' '}
          <Link href="#" className="underline hover:text-white">
            Kebijakan Privasi
          </Link> dan{' '}
          <Link href="#" className="underline hover:text-white">
            Syarat & Ketentuan
          </Link> Cellkom.
        </p>
      </div>
    </div>
  );
}