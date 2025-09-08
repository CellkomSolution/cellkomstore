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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl lg:grid lg:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-black">
        {/* Left Panel (Image) - Hidden on mobile */}
        <div className="hidden lg:flex relative items-center justify-center p-12 bg-blue-50 dark:bg-blue-900/20">
           <Image
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop"
            alt="Shopping illustration"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
          />
          <div className="relative z-10 text-center">
            <Image 
              src="/teslogocellkom.png" 
              alt="Cellkom Store Logo" 
              width={200}
              height={50}
              className="h-auto inline-block mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Belanja Mudah & Aman</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gabung dan nikmati jutaan produk terbaik.</p>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="p-8 md:p-12">
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
           <p className="text-sm text-center text-gray-500 mb-8">Masuk atau daftar untuk melanjutkan</p>
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
                    buttonBorderRadius: 'var(--radius)', // Corrected property name
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
            theme="light"
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