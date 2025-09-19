"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationForm, NotificationFormValues } from "@/components/admin/notification-form";
import { toast } from "sonner";
import { createNotification } from "@/lib/supabase/notifications";
import { getAllProfiles } from "@/lib/supabase/profiles";
import { useRouter } from "next/navigation";

export default function AdminSendNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: NotificationFormValues) => {
    setLoading(true);
    try {
      const allUsers = await getAllProfiles();
      const userIds = allUsers.map(profile => profile.id);

      if (userIds.length === 0) {
        toast.info("Tidak ada pengguna terdaftar untuk dikirimi notifikasi.");
        return;
      }

      const notificationPromises = userIds.map(userId =>
        createNotification(
          userId,
          values.type,
          values.title,
          values.message,
          values.link
        )
      );

      await Promise.all(notificationPromises);

      toast.success("Notifikasi berhasil dikirim ke semua pengguna!");
      // Optionally clear form or redirect
      // form.reset();
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      toast.error("Gagal mengirim notifikasi: " + (error.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Kirim Notifikasi Massal</h2>
      <p className="text-muted-foreground">
        Kirim notifikasi promosi atau pesan sistem kepada semua pengguna aplikasi Anda.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Buat Notifikasi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}