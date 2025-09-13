"use client";

import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useSession } from "@/context/session-context";
import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card"; // Keep Card for the welcome message if no children

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
    <div className="flex-1 flex flex-col h-[calc(100vh-120px)] p-4"> {/* Adjust height and add padding */}
      {children}
    </div>
  );
}