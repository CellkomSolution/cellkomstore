"use client";

import * as React from "react";
import { AdminChatList } from "@/components/admin-chat-list";
import { useSession } from "@/context/session-context";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isChatDetailRoute = pathname.startsWith("/chats/") && pathname !== "/chats";

  React.useEffect(() => {
    if (!isSessionLoading && user) {
      // Check if the user is an admin
      const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.user_role === 'admin';
      if (!isAdmin) {
        toast.error("Anda tidak memiliki izin untuk mengakses chat admin.");
        router.push("/"); // Redirect non-admin users
      }
    } else if (!isSessionLoading && !user) {
      toast.error("Anda harus login untuk mengakses chat admin.");
      router.push("/auth"); // Redirect to login if not authenticated
    }
  }, [isSessionLoading, user, router]);

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  // If user is not an admin or not logged in, the useEffect will handle redirection.
  // We can return null or a loading state here to prevent rendering the chat layout prematurely.
  if (!user || !(user?.user_metadata?.role === 'admin' || user?.app_metadata?.user_role === 'admin')) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden"> {/* Adjusted height */}
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