"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "@/hooks/use-admin";
import { useSession } from "@/context/session-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/config/admin-nav"; // Import adminNavItems
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft icon

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const getPageTitle = (path: string) => {
    const currentItem = adminNavItems.find(item => path.startsWith(item.href));
    if (currentItem) {
      // For detail pages like /admin/products/edit/123
      if (path.startsWith(currentItem.href) && path !== currentItem.href) {
        const parts = path.split('/');
        const lastPart = parts[parts.length - 1];
        // Check if the last part is likely an ID (not the base path segment itself)
        if (lastPart && lastPart !== currentItem.href.split('/').pop() && !isNaN(Date.parse(lastPart))) { // Simple check for ID-like string or date
          return `Edit ${currentItem.title.slice(0, -1)}`; // e.g., "Edit Produk"
        }
      }
      return currentItem.title;
    }
    // Specific titles for new/detail pages not covered by general 'edit' logic
    if (path.startsWith("/admin/products/new")) return "Tambah Produk Baru";
    if (path.startsWith("/admin/categories/new")) return "Tambah Kategori Baru";
    if (path.startsWith("/admin/hero-carousel/new")) return "Tambah Slide Baru";
    if (path.startsWith("/admin/featured-brands/new")) return "Tambah Merek Baru";
    if (path.startsWith("/admin/blog/new")) return "Tambah Postingan Baru";
    if (path.startsWith("/admin/payment-methods/new")) return "Tambah Metode Pembayaran Baru";
    if (path.startsWith("/admin/orders/")) return "Detail Pesanan";
    if (path.startsWith("/chats/")) return "Detail Chat";

    return "Dasbor Admin"; // Default title
  };

  const isDetailPage = pathname.split('/').length > 3 && pathname.startsWith('/admin/'); // Heuristic for detail pages
  const isChatDetailPage = pathname.startsWith('/chats/') && pathname !== '/chats';

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
          {adminNavItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname.startsWith(item.href) && "bg-muted hover:bg-muted")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
              {item.title === "Metode Pembayaran" && <Separator className="my-4" />} {/* Add separator after Payment Methods */}
            </React.Fragment>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {(isDetailPage || isChatDetailPage) && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Kembali</span>
            </Button>
          )}
          <h1 className="text-xl font-semibold">{getPageTitle(pathname)}</h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}