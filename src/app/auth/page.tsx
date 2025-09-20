"use client";

import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/context/session-context";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { OtpSignupForm } from "@/components/auth/otp-signup-form"; // Import the new OTP signup form
import { Button } from "@/components/ui/button"; // Import Button for custom links

type AuthMode = 'signin' | 'signup_otp' | 'forgot_password';

export default function AuthPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const { theme } = useTheme();
  const [authMode, setAuthMode] = useState<AuthMode>('signin'); // State to switch between sign-in and OTP sign-up

  useEffect(() => {
    if (!isLoading && session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

  if (isLoading || session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }

  const renderAuthComponent = (view: 'sign_in' | 'sign_up' | 'forgot_password') => (
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
            },
            radii: {
              buttonBorderRadius: 'var(--radius)',
            },
          },
        },
        className: {
          button: 'py-2.5 text-sm',
          input: 'py-2.5 text-sm',
          label: 'text-sm',
          anchor: 'text-sm'
        },
      }}
      theme={theme === "dark" ? "dark" : "light"}
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
          forgot_password: {
            email_label: 'Nomor HP atau email',
            button_label: 'Kirim instruksi reset',
            link_text: 'Ingat kata sandi? Masuk',
          },
          update_password: {
            password_label: 'Kata Sandi Baru',
            password_input_placeholder: 'Kata Sandi Baru Anda',
            button_label: 'Perbarui Kata Sandi',
            link_text: 'Kembali ke Masuk',
          },
        },
      }}
      view={view}
      redirectTo={typeof window !== 'undefined' ? window.location.origin : undefined}
    />
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full h-screen lg:h-auto lg:max-w-4xl lg:grid lg:grid-cols-2 lg:rounded-2xl lg:shadow-2xl overflow-hidden bg-card">
        {/* Left Panel (Image) - Hidden on mobile */}
        <div className="hidden lg:flex relative items-center justify-center p-12 bg-black">
           <Image
            src="/bg-login.jpeg"
            alt="Shopping illustration"
            layout="fill"
            objectFit="cover"
            className="opacity-100"
          />
          <div className="relative z-10 text-center">
            <Image
              src="/teslogocellkom.png"
              alt="Cellkom Store Logo"
              width={200}
              height={50}
              className="h-auto inline-block mb-4"
            />
            <h1 className="text-2xl font-bold text-white">Belanja Mudah & Aman</h1>
            <p className="text-gray-300 mt-2">Gabung dan nikmati jutaan produk terbaik.</p>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
           {/* Mobile Header Image */}
           <div className="lg:hidden mb-8 text-center">
             <Image
                src="/teslogocellkom.png"
                alt="Cellkom Store Logo"
                width={150}
                height={38}
                className="h-auto inline-block"
              />
           </div>
           <h2 className="text-2xl font-bold text-center mb-1 text-gray-900 dark:text-white">Selamat Datang</h2>
           <p className="text-sm text-center text-gray-500 mb-8">
             {authMode === 'signin' && 'Masuk atau daftar untuk melanjutkan'}
             {authMode === 'signup_otp' && 'Daftar akun baru dengan email'}
             {authMode === 'forgot_password' && 'Masukkan email Anda untuk mereset kata sandi'}
           </p>

           {authMode === 'signin' && renderAuthComponent('sign_in')}
           {authMode === 'signup_otp' && <OtpSignupForm onSwitchToSignIn={() => setAuthMode('signin')} />}
           {authMode === 'forgot_password' && renderAuthComponent('forgot_password')}

           {authMode === 'signin' && (
             <p className="text-sm text-center text-gray-500 mt-4">
               Belum punya akun?{" "}
               <Button variant="link" onClick={() => setAuthMode('signup_otp')} className="p-0 h-auto dark:hover:text-blue-400">
                 Daftar, yuk!
               </Button>
             </p>
           )}
           {authMode === 'signin' && (
             <p className="text-sm text-center text-gray-500 mt-2">
               <Button variant="link" onClick={() => setAuthMode('forgot_password')} className="p-0 h-auto dark:hover:text-blue-400">
                 Lupa kata sandi?
               </Button>
             </p>
           )}
           {(authMode === 'signup_otp' || authMode === 'forgot_password') && (
             <p className="text-sm text-center text-gray-500 mt-4">
               <Button variant="link" onClick={() => setAuthMode('signin')} className="p-0 h-auto dark:hover:text-blue-400">
                 Kembali ke Masuk
               </Button>
             </p>
           )}

           <p className="text-xs text-center text-gray-500 mt-8">
             Dengan log in, kamu menyetujui{' '}
             <Link href="#" className="underline hover:text-primary">
               Kebijakan Privasi
             </Link> dan{' '}
             <Link href="#" className="underline hover:text-primary">
               Syarat & Ketentuan
             </Link> Cellkom.
           </p>
        </div>
      </div>
    </div>
  );
}