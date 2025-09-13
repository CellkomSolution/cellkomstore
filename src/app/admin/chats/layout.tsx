"use client";

import * as React from "react";
import { AdminChatList } from "@/components/admin-chat-list";
import { useSession } from "@/context/session-context";
import { Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    router.push("/login");
    return null;
  }

  // Check if the user is an admin (assuming role is in profile)
  // This check should ideally be done server-side or via a dedicated hook
  // For now, we'll rely on the profile role from session context
  // In a real app, you'd have a more robust admin check
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.user_role === 'admin'; // Adjust based on actual role storage

  if (!isAdmin) {
    // Redirect non-admin users
    router.push("/"); // Or to an access denied page
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Column: Chat List */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col bg-card shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Chat Admin
          </h1>
        </div>
        <AdminChatList />
      </div>

      {/* Right Column: Chat Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}