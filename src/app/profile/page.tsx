"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Textarea } from "@/components/ui/textarea";

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "Nama depan tidak boleh kosong." }).optional().or(z.literal("")),
  last_name: z.string().min(1, { message: "Nama belakang tidak boleh kosong." }).optional().or(z.literal("")),
  bio: z.string().max(500, { message: "Bio tidak boleh lebih dari 500 karakter." }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, profile, refetchProfile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!isSessionLoading && !user) {
      router.push("/auth");
    }
  }, [user, isSessionLoading, router]);

  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        bio: values.bio,
      }) // Removed updated_at: new Date().toISOString()
      .eq("id", user.id);

    if (error) {
      toast.error("Gagal memperbarui profil: " + error.message);
    } else {
      await refetchProfile();
      toast.success("Profil berhasil diperbarui!");
    }
  }

  async function handleAvatarUploadSuccess(newUrl: string) {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl }) // Removed updated_at: new Date().toISOString()
      .eq("id", user.id);

    if (error) {
      toast.error("Gagal menyimpan avatar baru: " + error.message);
    } else {
      await refetchProfile();
      toast.success("Avatar berhasil diperbarui!");
    }
  }

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Memuat profil...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profil Pengguna</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center text-center">
          <AvatarUploader
            userId={user.id}
            currentAvatarUrl={profile?.avatar_url || null}
            onUploadSuccess={handleAvatarUploadSuccess}
            fallbackName={profile?.first_name || user.email?.split('@')[0] || ""}
          />
          <CardTitle className="text-2xl">
            {profile?.first_name || user.email?.split('@')[0] || "Pengguna"} {profile?.last_name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Depan</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Depan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Belakang</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Belakang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tentang Saya</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ceritakan tentang diri Anda..."
                        className="resize-y min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}