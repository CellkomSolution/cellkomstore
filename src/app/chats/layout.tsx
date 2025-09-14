"use client";

import * as React from "react";
import { AdminChatList } from "@/components/admin-chat-list";
import { useSession } from "@/context/session-context";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CardHeader, CardTitle } from "@/components/ui/card"; // Hanya import CardHeader dan CardTitle
import { useAdmin } from "@/hooks/use-admin";

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const isChatDetailRoute = pathname.startsWith("/chats/") && pathname !== "/chats";

  React.useEffect(() => {
    if (!isSessionLoading && !isAdminLoading) {
      if (!user) {
        toast.error("Anda harus login untuk mengakses chat admin.");
        router.push("/auth");
      } else if (!isAdmin) {
        toast.error("Anda tidak memiliki izin untuk mengakses chat admin.");
        router.push("/");
      }
    }
  }, [isSessionLoading, isAdminLoading, user, isAdmin, router]);

  if (isSessionLoading || isAdminLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat dasbor admin...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden">
      {/* Left Column: Chat List */}
      <div className={`
        w-full md:w-1/3 lg:w-1/4 flex flex-col border-r bg-background
        ${isChatDetailRoute ? 'hidden md:flex' : 'flex'} 
      `}>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Daftar Chat
          </CardTitle>
        </CardHeader>
        <div className="flex-1"> {/* Mengganti CardContent dengan div */}
          <AdminChatList />
        </div>
      </div>

      {/* Right Column: Chat Detail / Placeholder */}
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
            <CardTitle className="text-lg ml-2">Detail Chat</CardTitle>
          </CardHeader>
        )}
        {children}
      </div>
    </div>
  );
}