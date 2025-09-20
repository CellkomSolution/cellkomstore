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
import { Textarea } from "@/components/ui/textarea";
import { SettingsFormValues } from "@/lib/types/app-settings"; // Import the main form values type

interface ContactSocialSettingsFormProps {
  isSubmitting: boolean;
}

export function ContactSocialSettingsForm({ isSubmitting }: ContactSocialSettingsFormProps) {
  const form = useFormContext<SettingsFormValues>();

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Informasi Kontak</h3>
      <FormField
        control={form.control}
        name="contact_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Kontak</FormLabel>
            <FormControl>
              <Input placeholder="support@example.com" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contact_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor Telepon Kontak</FormLabel>
            <FormControl>
              <Input placeholder="+62 812 3456 7890" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contact_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alamat Kontak</FormLabel>
            <FormControl>
              <Textarea placeholder="Jl. Contoh No. 123, Kota, Negara" className="resize-y min-h-[80px]" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold mt-8">Tautan Media Sosial</h3>
      <FormField
        control={form.control}
        name="facebook_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Facebook</FormLabel>
            <FormControl>
              <Input placeholder="https://facebook.com/yourpage" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="instagram_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Instagram</FormLabel>
            <FormControl>
              <Input placeholder="https://instagram.com/yourpage" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="twitter_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Twitter</FormLabel>
            <FormControl>
              <Input placeholder="https://twitter.com/yourpage" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="youtube_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL YouTube</FormLabel>
            <FormControl>
              <Input placeholder="https://youtube.com/yourchannel" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="linkedin_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL LinkedIn</FormLabel>
            <FormControl>
              <Input placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}