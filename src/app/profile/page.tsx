"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";
import { createClient } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "Nama depan tidak boleh kosong." }).optional().or(z.literal("")),
  last_name: z.string().min(1, { message: "Nama belakang tidak boleh kosong." }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = React.useState<ProfileFormValues | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!isSessionLoading && !user) {
      router.push("/auth"); // Redirect if not authenticated
    }
  }, [user, isSessionLoading, router]);

  React.useEffect(() => {
    async function getProfile() {
      if (user) {
        setIsProfileLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Gagal memuat profil: " + error.message);
        } else if (data) {
          setProfile(data);
          form.reset(data); // Set form default values
        }
        setIsProfileLoading(false);
      }
    }

    getProfile();
  }, [user, supabase, form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Gagal memperbarui profil: " + error.message);
    } else {
      toast.success("Profil berhasil diperbarui!");
      setProfile((prev) => ({ ...prev, ...values }));
    }
  }

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Memuat profil...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profil Pengguna</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback className="text-4xl">
              {profile?.first_name ? profile.first_name[0].toUpperCase() : <UserIcon className="h-12 w-12" />}
            </AvatarFallback>
          </Avatar>
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