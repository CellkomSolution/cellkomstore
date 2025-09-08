"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Category } from "@/lib/supabase-queries"; // Import Category interface
import * as LucideIcons from "lucide-react"; // Import all Lucide icons

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }).max(50, { message: "Nama kategori maksimal 50 karakter." }),
  slug: z.string().min(3, { message: "Slug minimal 3 karakter." }).max(50, { message: "Slug maksimal 50 karakter." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug harus berupa huruf kecil, angka, dan tanda hubung (tanpa spasi)." }),
  icon_name: z.string().nullable().optional(), // Memungkinkan null dan opsional
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),
});

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  loading?: boolean;
}

export function CategoryForm({ initialData, onSubmit, loading = false }: CategoryFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      icon_name: initialData?.icon_name ?? undefined, // Menggunakan undefined untuk optional fields
      order: initialData?.order ?? 0,
    },
  });

  // Function to render Lucide icon dynamically
  const renderIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5 mr-2" /> : null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Handphone & Tablet" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Nama kategori yang akan ditampilkan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: handphone-tablet" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Slug unik untuk URL (huruf kecil, tanpa spasi, gunakan tanda hubung).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Ikon (Lucide)</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  {renderIcon(field.value)}
                  <Input placeholder="Contoh: Smartphone" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormDescription>
                Nama ikon dari <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Lucide React</a> (misalnya, `Smartphone`, `Shirt`).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urutan Tampilan</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} value={field.value ?? 0} />
              </FormControl>
              <FormDescription>
                Angka yang lebih rendah akan muncul lebih dulu.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? "Simpan Perubahan" : "Buat Kategori"
          )}
        </Button>
      </form>
    </Form>
  );
}