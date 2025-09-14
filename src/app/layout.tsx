import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header"; // Diperbaiki: Menggunakan default import
import { Footer } from "@/components/footer";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/context/session-context";
import { getAppSettings } from "@/lib/supabase/app-settings";
import { OrderNotificationProvider } from "@/context/order-notification-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Menambahkan import untuk React Query

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  return {
    title: settings?.site_name || "Cellkom Store",
    description: "Cellkom Store built with Next.js",
  };
}

// Buat instance QueryClient di luar komponen untuk menghindari pembuatan ulang
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}> {/* Membungkus aplikasi dengan QueryClientProvider */}
            <SessionProvider>
              <OrderNotificationProvider>
                <CartProvider>
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <Toaster richColors />
                </CartProvider>
              </OrderNotificationProvider>
            </SessionProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}