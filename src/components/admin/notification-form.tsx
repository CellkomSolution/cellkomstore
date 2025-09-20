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
import { Loader2 } from "lucide-react";
import { Notification } from "@/lib/supabase/notifications";
import { getAdminUserId, getAllProfiles, Profile } from "@/lib/supabase/profiles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  user_id: z.string().uuid({ message: "ID pengguna tidak valid." }).nullable().default(null), // Nullable for 'all users' option
  title: z.string().min(3, { message: "Judul minimal 3 karakter." }).max(100, { message: "Judul maksimal 100 karakter." }),
  message: z.string().min(10, { message: "Pesan minimal 10 karakter." }).max(500, { message: "Pesan maksimal 500 karakter." }),
  link: z.string().url({ message: "URL tautan tidak valid." }).nullable().default(null),
  is_read: z.boolean().default(false),
});

export type NotificationFormValues = z.infer<typeof formSchema>;

interface NotificationFormProps {
  initialData?: Notification | null;
  onSubmit: (values: NotificationFormValues) => Promise<void>;
  loading?: boolean;
}

export function NotificationForm({ initialData, onSubmit, loading = false }: NotificationFormProps) {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);
  const [adminId, setAdminId] = React.useState<string | null>(null);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: initialData?.user_id ?? null,
      title: initialData?.title ?? "",
      message: initialData?.message ?? "",
      link: initialData?.link ?? null,
      is_read: initialData?.is_read ?? false,
    },
  });

  React.useEffect(() => {
    async function fetchUsersAndAdminId() {
      setIsLoadingUsers(true);
      const fetchedUsers = await getAllProfiles();
      const fetchedAdminId = await getAdminUserId();
      setUsers(fetchedUsers.filter(p => p.id !== fetchedAdminId)); // Exclude admin from user list
      setAdminId(fetchedAdminId);
      setIsLoadingUsers(false);
    }
    fetchUsersAndAdminId();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penerima Notifikasi</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "all"} disabled={isLoadingUsers || loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingUsers ? "Memuat pengguna..." : "Pilih pengguna atau semua"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">Semua Pengguna (Kecuali Admin)</SelectItem>
                  {users.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.first_name} {profile.last_name} ({profile.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih pengguna spesifik atau kirim ke semua pengguna (tidak termasuk admin).
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
                  placeholder="Isi pesan notifikasi..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
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
                Tautan yang akan dibuka saat notifikasi diklik.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {initialData && ( // Only show is_read for existing notifications
          <FormField
            control={form.control}
            name="is_read"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sudah Dibaca</FormLabel>
                  <FormDescription>
                    Tandai notifikasi ini sebagai sudah dibaca.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? "Simpan Perubahan" : "Kirim Notifikasi"
          )}
        </Button>
      </form>
    </Form>
  );
}