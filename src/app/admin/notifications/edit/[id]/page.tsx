"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationForm, NotificationFormValues } from "@/components/admin/notification-form";
import { toast } from "sonner";
import { getNotifications, updateNotification, Notification } from "@/lib/supabase/notifications";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton"; // Reusing skeleton
import { useSession } from "@/context/session-context";

interface EditNotificationPageProps {
  params: Promise<{ id: string }>;
}

export default function EditNotificationPage({ params }: EditNotificationPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { user: adminUser } = useSession();

  const [initialData, setInitialData] = React.useState<Notification | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchNotification() {
      setIsLoading(true);
      // Admin can view all notifications, so we pass adminUser.id for policy check
      const fetchedNotifications = await getNotifications(adminUser?.id || '');
      const notification = fetchedNotifications.find(n => n.id === id);

      if (notification) {
        setInitialData(notification);
      } else {
        toast.error("Notifikasi tidak ditemukan.");
        router.push("/admin/notifications");
      }
      setIsLoading(false);
    }
    fetchNotification();
  }, [id, router, adminUser]);

  const onSubmit = async (values: NotificationFormValues) => {
    setIsSubmitting(true);
    try {
      if (!initialData) {
        toast.error("Data notifikasi tidak tersedia untuk diperbarui.");
        return;
      }

      // Note: user_id cannot be changed after creation for a specific notification.
      // If 'all users' option is selected during edit, it should be handled as a new broadcast.
      // For simplicity, this edit form assumes editing an existing notification for its original user_id.
      // The user_id field in the form is primarily for 'new' notifications.
      // When editing, we only update title, message, link, and is_read.
      const notificationData = {
        title: values.title,
        message: values.message,
        link: values.link || null,
        is_read: values.is_read,
      };

      await updateNotification(id, notificationData);

      toast.success("Notifikasi berhasil diperbarui!");
      router.push("/admin/notifications");
    } catch (error: any) {
      console.error("Error updating notification:", error);
      toast.error("Gagal memperbarui notifikasi: " + (error.message || "Terjadi kesalahan."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Memuat Notifikasi...</h2>
        <ProductDetailPageSkeleton />
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Edit Notifikasi: {initialData.title}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationForm initialData={initialData} onSubmit={onSubmit} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}