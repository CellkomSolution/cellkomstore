"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  bucketName: string; // Nama bucket Supabase Storage (e.g., 'avatars', 'product-images', 'carousel-images')
  currentImageUrl: string | null;
  onUploadSuccess: (newUrl: string) => void;
  onRemove?: () => void; // Opsional: fungsi untuk menghapus gambar
  disabled?: boolean;
  className?: string;
  aspectRatio?: string; // e.g., "aspect-square", "aspect-video"
}

export function ImageUploader({
  bucketName,
  currentImageUrl,
  onUploadSuccess,
  onRemove,
  disabled = false,
  className,
  aspectRatio = "aspect-square",
}: ImageUploaderProps) {
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
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error("Tidak bisa mendapatkan URL publik untuk gambar.");
      }

      onUploadSuccess(data.publicUrl);
      toast.success("Gambar berhasil diunggah!");

    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  };

  const triggerFileInput = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {currentImageUrl ? (
        <div className={`relative w-full max-w-md ${aspectRatio}`}>
          <Image
            src={currentImageUrl}
            alt="Image Preview"
            fill
            style={{ objectFit: "contain" }}
            className="p-2 border rounded-lg"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-6 w-6"
              onClick={onRemove}
              disabled={disabled || uploading}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Hapus Gambar</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-background"
            onClick={triggerFileInput}
            disabled={disabled || uploading}
          >
            <UploadCloud className="h-4 w-4" />
            <span className="sr-only">Ubah Gambar</span>
          </Button>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center w-full max-w-md border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 ${aspectRatio}`}
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleUpload}
            disabled={disabled || uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Mengunggah...</p>
            </>
          ) : (
            <div className="text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Klik untuk mengunggah</span> atau seret & lepas
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}