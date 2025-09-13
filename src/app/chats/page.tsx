"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { AdminChatList } from "@/components/admin-chat-list";

export default function AdminChatsPage() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Percakapan Chat Admin
        </CardTitle>
      </CardHeader>
      <AdminChatList />
    </Card>
  );
}