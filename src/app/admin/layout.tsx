"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import { useAdmin } from "@/hooks/use-admin";
import { useSession } from "@/context/session-context";
import Link from "next/link";
import { LayoutDashboard, Package, Settings, Users, Image as ImageIcon } from "lucide-react"; // Import ImageIcon
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Import cn for conditional classNames

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const { isLoading: isSessionLoading, user } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();

  React.useEffect(() => {
    if (!isSessionLoading && !isAdminLoading) {
      if (!user) {
        toast.error("Anda harus login untuk mengakses dasbor admin.");
        router.push("/auth");
      } else if (!isAdmin) {
        toast.error("Anda tidak memiliki izin untuk mengakses dasbor admin.");
        router.push("/");
      }
    }
  }, [isSessionLoading, isAdminLoading, user, isAdmin, router]);

  if (isSessionLoading || isAdminLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Memuat dasbor admin...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background p-4">
        <div className="flex items-center h-16 px-4">
          <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-1 space-y-2 py-4">
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start", pathname === "/admin/dashboard" && "bg-muted hover:bg-muted")} 
            asChild
          >
            <Link href="/admin/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start", pathname.startsWith("/admin/products") && "bg-muted hover:bg-muted")} 
            asChild
          >
            <Link href="/admin/products">
              <Package className="mr-2 h-4 w-4" />
              Produk
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start", pathname.startsWith("/admin/hero-carousel") && "bg-muted hover:bg-muted")} 
            asChild
          >
            <Link href="/admin/hero-carousel">
              <ImageIcon className="mr-2 h-4 w-4" />
              Hero Carousel
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start", pathname === "/admin/users" && "bg-muted hover:bg-muted")} 
            asChild
          >
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Pengguna
            </Link>
          </Button>
          <Separator className="my-4" />
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start", pathname === "/admin/settings" && "bg-muted hover:bg-muted")} 
            asChild
          >
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </Link>
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-xl font-semibold">Dasbor Admin</h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}