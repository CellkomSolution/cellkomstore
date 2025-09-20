import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./profiles";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user_profile?: Profile; // Joined user profile
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      user_profile:profiles!user_id(id, first_name, last_name, avatar_url, email)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error.message || error);
    return [];
  }
  return data.map(notif => ({
    ...notif,
    user_profile: notif.user_profile as Profile | undefined,
  })) as Notification[];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread notification count:", error.message || error);
    return 0;
  }
  return count || 0;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error.message || error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error(`Error marking all notifications for user ${userId} as read:`, error.message || error);
    throw error;
  }
}

export async function createNotification(notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'user_profile'>): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert(notificationData)
    .select(`
      *,
      user_profile:profiles!user_id(id, first_name, last_name, avatar_url, email)
    `)
    .single();

  if (error) {
    console.error("Error creating notification:", error.message || error);
    throw error;
  }
  return {
    ...data,
    user_profile: data.user_profile as Profile | undefined,
  } as Notification;
}

export async function updateNotification(id: string, notificationData: Partial<Omit<Notification, 'id' | 'created_at' | 'user_profile'>>): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ ...notificationData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`
      *,
      user_profile:profiles!user_id(id, first_name, last_name, avatar_url, email)
    `)
    .single();

  if (error) {
    console.error(`Error updating notification with ID ${id}:`, error.message || error);
    throw error;
  }
  return {
    ...data,
    user_profile: data.user_profile as Profile | undefined,
  } as Notification;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting notification with ID ${id}:`, error.message || error);
    throw error;
  }
}