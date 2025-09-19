"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  onSendMessage: (e: React.FormEvent) => void;
}

export function ChatInput({ newMessage, setNewMessage, isSending, onSendMessage }: ChatInputProps) {
  return (
    <form onSubmit={onSendMessage} className="flex gap-2 mt-4">
      <Input
        placeholder="Ketik pesan Anda..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        disabled={isSending}
        className="flex-1"
      />
      <Button type="submit" disabled={isSending}>
        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span className="sr-only">Kirim</span>
      </Button>
    </form>
  );
}