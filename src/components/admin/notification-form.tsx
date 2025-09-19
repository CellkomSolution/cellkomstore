"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createNotification, Notification as SupabaseNotification } from "@/lib/supabase/notifications";
import { getAllProfiles, Profile } from "@/lib/supabase/profiles";

const formSchema = z.object({
  type: z.enum(['promotion', 'system'], { message: "Tipe notifikasi harus dipilih." }),
  title: z.string().min(5, { message: "Judul minimal 5 karakter." }).max(100, { message: "Judul maksimal 100 karakter." }),
  message: z.string().min(10, { message: "Pesan minimal 10 karakter." }).max(500, { message: "Pesan maksimal 500 karakter." }),
  link: z.string().url({ message: "URL tautan tidak valid." }).nullable().optional().default(null),
});

export type NotificationFormValues = z.infer<typeof formSchema>;

interface NotificationFormProps {
  onSubmit: (values: NotificationFormValues) => Promise<void>;
  loading?: boolean;
}

export function NotificationForm({ onSubmit, loading = false }: NotificationFormProps) {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'promotion',
      title: "",
      message: "",
      link: null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Notifikasi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe notifikasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="promotion">Promosi</SelectItem>
                  <SelectItem value="system">Sistem</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih apakah ini notifikasi promosi atau pesan sistem umum.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Notifikasi</FormLabel>
              <FormControl>
                <Input placeholder="Judul singkat notifikasi" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Judul yang akan muncul di notifikasi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pesan Notifikasi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis pesan lengkap notifikasi di sini..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Isi pesan yang akan diterima pengguna.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Tautan (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://cellkom.com/promo" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Jika diisi, notifikasi akan memiliki tautan yang dapat diklik.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Notifikasi ke Semua Pengguna"
          )}
        </Button>
      </form>
    </Form>
  );
}