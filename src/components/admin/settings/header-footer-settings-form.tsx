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
import { Switch } from "@/components/ui/switch";
import { SettingsFormValues } from "@/lib/types/app-settings"; // Import the main form values type

interface HeaderFooterSettingsFormProps {
  isSubmitting: boolean;
}

export function HeaderFooterSettingsForm({ isSubmitting }: HeaderFooterSettingsFormProps) {
  const form = useFormContext<SettingsFormValues>();

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Pengaturan Header Bawah</h3>
      <FormField
        control={form.control}
        name="scrolling_text_enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Aktifkan Teks Berjalan</FormLabel>
              <FormDescription>
                Tampilkan teks yang bergerak di bagian kiri bawah header.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false} // Ensure boolean
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("scrolling_text_enabled") && (
        <FormField
          control={form.control}
          name="scrolling_text_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten Teks Berjalan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Promo Spesial Akhir Tahun! Diskon hingga 50%!" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Teks yang akan ditampilkan dan bergerak.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="store_status_enabled" // New field
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Aktifkan Status Toko Offline</FormLabel>
              <FormDescription>
                Tampilkan status buka/tutup toko offline di teks berjalan header.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("store_status_enabled") && (
        <FormField
          control={form.control}
          name="store_status_content" // New field
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten Status Toko Offline</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Toko Buka (09:00 - 21:00)" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Teks yang akan ditampilkan sebagai status toko offline.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="right_header_text_enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Aktifkan Teks Kanan Header</FormLabel>
              <FormDescription>
                Tampilkan teks atau tautan di bagian kanan bawah header.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false} // Ensure boolean
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("right_header_text_enabled") && (
        <>
          <FormField
            control={form.control}
            name="right_header_text_content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten Teks Kanan Header</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Cek Promo Terbaru!" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Teks yang akan ditampilkan di sisi kanan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="right_header_text_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Tautan Teks Kanan (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://cellkom.com/promo" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Jika diisi, teks akan menjadi tautan yang dapat diklik.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <h3 className="text-lg font-semibold mt-8">Pengaturan Aplikasi</h3>
      <FormField
        control={form.control}
        name="download_app_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Unduhan Aplikasi</FormLabel>
            <FormControl>
              <Input placeholder="https://play.google.com/store/apps/details?id=com.example.app" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              Tautan untuk mengunduh aplikasi seluler Anda (misalnya, dari Play Store atau App Store).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("download_app_url") && (
        <FormField
          control={form.control}
          name="download_app_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teks Unduhan Aplikasi</FormLabel>
              <FormControl>
                <Input placeholder="Download Aplikasi Cellkom" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Teks yang akan ditampilkan untuk tautan unduhan aplikasi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}