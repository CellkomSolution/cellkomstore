"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/image-uploader";
import { SettingsFormValues } from "@/app/admin/settings/page"; // Import the main form values type

interface GeneralSettingsFormProps {
  isSubmitting: boolean;
}

export function GeneralSettingsForm({ isSubmitting }: GeneralSettingsFormProps) {
  const form = useFormContext<SettingsFormValues>();

  const handleLogoUploadSuccess = (newUrl: string) => {
    form.setValue("site_logo_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveLogo = () => {
    form.setValue("site_logo_url", null, { shouldValidate: true });
  };

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="site_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Situs</FormLabel>
            <FormControl>
              <Input placeholder="Nama Toko Anda" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              Nama yang akan ditampilkan di header, footer, dan judul halaman. Jika kosong, akan menggunakan nama default.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Logo Situs</FormLabel>
        <FormControl>
          <ImageUploader
            bucketName="app-assets"
            currentImageUrl={form.watch("site_logo_url") ?? null}
            onUploadSuccess={handleLogoUploadSuccess}
            onRemove={handleRemoveLogo}
            disabled={isSubmitting}
            aspectRatio="aspect-video"
            className="max-w-xs"
          />
        </FormControl>
        <FormDescription>
          Unggah logo utama situs Anda.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </div>
  );
}