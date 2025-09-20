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
import { SettingsFormValues } from "@/lib/types/app-settings"; // Import the main form values type

interface FeaturedBrandsSettingsFormProps {
  isSubmitting: boolean;
}

export function FeaturedBrandsSettingsForm({ isSubmitting }: FeaturedBrandsSettingsFormProps) {
  const form = useFormContext<SettingsFormValues>();

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="featured_brands_title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Judul Merek Unggulan</FormLabel>
            <FormControl>
              <Input placeholder="Brand Pilihan" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              Judul yang akan ditampilkan di bagian merek unggulan pada halaman beranda.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}