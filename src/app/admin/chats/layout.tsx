"use client";

import * as React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useSession } from "@/context/session-context";
import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AdminChatsPage from "./page"; // Import the list component as default

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();

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
        <p className="ml-2">Memuat halaman chat admin...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-120px)]"> {/* Adjust height to fit header/footer */}
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[calc(100vh-120px)] rounded-lg border"
      >
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <AdminChatsPage /> {/* Use the default imported component */}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          {children ? (
            children
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
              <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center">
                <MessageSquare className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Selamat Datang di Chat Admin</h3>
                <p className="text-sm">Pilih percakapan dari daftar di sebelah kiri untuk memulai.</p>
              </Card>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}