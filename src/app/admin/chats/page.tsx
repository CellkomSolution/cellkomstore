"use client";

import { MessageSquare } from "lucide-react";
import * as React from "react";

export default function AdminChatDefaultPage() {
  return (
    <div className="flex flex-1 items-center justify-center h-full bg-muted/40">
      <div className="text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4" />
        <p className="text-lg font-medium">Pilih percakapan dari daftar di samping</p>
        <p className="text-sm">untuk melihat pesan dan membalas.</p>
      </div>
    </div>
  );
}