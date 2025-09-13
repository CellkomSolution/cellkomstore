"use client";

import * as React from "react";
import { AdminChatList } from "@/components/admin-chat-list";
import { useSession } from "@/context/session-context";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/use-admin"; // Import useAdmin

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin(); // Gunakan useAdmin hook
  const router = useRouter();
  const pathname = usePathname();

  const isChatDetailRoute = pathname.startsWith("/chats/") && pathname !== "/chats";

  React.useEffect(() => {
    if (!isSessionLoading && !isAdminLoading) { // Tunggu hingga status admin juga dimuat
      if (!user) {
        toast.error("Anda harus login untuk mengakses chat admin.");
        router.push("/auth"); // Redirect to login if not authenticated
      } else if (!isAdmin) { // Gunakan isAdmin dari useAdmin
        toast.error("Anda tidak memiliki izin untuk mengakses chat admin.");
        router.push("/"); // Redirect non-admin users
      }
    }
  }, [isSessionLoading, isAdminLoading, user, isAdmin, router]);

  if (isSessionLoading || isAdminLoading) { // Tambahkan isAdminLoading ke kondisi loading
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  // Jika user tidak ada atau bukan admin, useEffect akan menangani pengalihan.
  // Kita bisa mengembalikan null atau loading state di sini untuk mencegah rendering layout chat sebelum waktunya.
  if (!user || !isAdmin) { // Gunakan isAdmin dari useAdmin
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden">
      {/* Left Column: Chat List */}
      <Card className={`
        w-full md:w-1/3 lg:w-1/4 flex flex-col border-r rounded-none shadow-none
        ${isChatDetailRoute ? 'hidden md:flex' : 'flex'} 
      `}>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Chat Admin
          </CardTitle>
        </CardHeader>
        <AdminChatList />
      </Card>

      {/* Right Column: Chat Detail */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isChatDetailRoute ? 'flex' : 'hidden md:flex'} 
      `}>
        {isChatDetailRoute && (
          <CardHeader className="md:hidden p-2 border-b bg-card flex flex-row items-center">
            <Button variant="ghost" size="icon" onClick={() => router.push("/chats")}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Kembali ke daftar chat</span>
            </Button>
            <CardTitle className="text-lg ml-2">Detail Chat</CardTitle> {/* Placeholder title */}
          </CardHeader>
        )}
        {children}
      </div>
    </div>
  );
}