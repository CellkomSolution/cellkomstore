"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadSuccess: (newUrl: string) => void;
  fallbackName: string;
}

export function AvatarUploader({ userId, currentAvatarUrl, onUploadSuccess, fallbackName }: AvatarUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Anda harus memilih gambar untuk diunggah.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      // Create a unique path within a folder for the user
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error("Tidak bisa mendapatkan URL publik untuk avatar.");
      }

      onUploadSuccess(data.publicUrl);
      toast.success("Avatar berhasil diperbarui!");

    } catch (error: any) {
      toast.error("Gagal mengunggah avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={currentAvatarUrl ?? undefined} alt="User Avatar" key={currentAvatarUrl} />
        <AvatarFallback className="text-4xl">
          {fallbackName ? fallbackName[0].toUpperCase() : <UserIcon className="h-12 w-12" />}
        </AvatarFallback>
      </Avatar>
      <Button
        size="icon"
        variant="outline"
        className="absolute bottom-4 right-0 rounded-full h-8 w-8 bg-background"
        onClick={triggerFileInput}
        disabled={uploading}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit Avatar</span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}