import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: 'order_status_update' | 'payment_status_update' | 'new_message' | 'promotion' | 'system';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  link: string | null = null
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, type, title, message, link })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error.message);
    throw new Error("Gagal membuat notifikasi.");
  }
  return data;
}

export async function getNotifications(userId: string, includeRead: boolean = false): Promise<Notification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!includeRead) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notifications:", error.message);
    return [];
  }
  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() }) // Add updated_at for consistency
    .eq("id", notificationId);

  if (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error.message);
    throw new Error("Gagal menandai notifikasi sebagai sudah dibaca.");
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error(`Error marking all notifications for user ${userId} as read:`, error.message);
    throw new Error("Gagal menandai semua notifikasi sebagai sudah dibaca.");
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread notifications count:", error.message);
    return 0;
  }
  return count || 0;
}