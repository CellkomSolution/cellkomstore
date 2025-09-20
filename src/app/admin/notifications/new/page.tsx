"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationForm, NotificationFormValues } from "@/components/admin/notification-form";
import { toast } from "sonner";
import { createNotification } from "@/lib/supabase/notifications";
import { getAllProfiles } from "@/lib/supabase/profiles";

export default function NewNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: NotificationFormValues) => {
    setLoading(true);
    try {
      if (values.user_id === "all") {
        // Send to all users (excluding admin)
        const allProfiles = await getAllProfiles();
        const adminProfile = allProfiles.find(p => p.role === 'admin');
        const nonAdminUsers = allProfiles.filter(p => p.id !== adminProfile?.id);

        for (const userProfile of nonAdminUsers) {
          await createNotification({
            user_id: userProfile.id,
            title: values.title,
            message: values.message,
            link: values.link || null,
            is_read: false,
          });
        }
        toast.success("Notifikasi berhasil dikirim ke semua pengguna!");
      } else {
        // Send to a specific user
        await createNotification({
          user_id: values.user_id!, // user_id is guaranteed to be a string here
          title: values.title,
          message: values.message,
          link: values.link || null,
          is_read: false,
        });
        toast.success("Notifikasi berhasil dikirim!");
      }
      router.push("/admin/notifications");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Gagal mengirim notifikasi: " + (error.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Kirim Notifikasi Baru</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}