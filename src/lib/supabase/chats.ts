import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./profiles";
import { Product } from "./products";

export type ChatMessage = {
  id: string;
  product_id: string | null;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  updated_at: string;
  sender_profile: Profile[];
  receiver_profile: Profile[];
  products?: Product[];
  type?: 'system' | 'message';
};

export async function getChatMessages(user1Id: string, user2Id: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chats")
    .select(`
      *,
      sender_profile:profiles!sender_id (first_name, last_name, avatar_url, role),
      receiver_profile:profiles!receiver_id (first_name, last_name, avatar_url, role),
      products (name, image_url)
    `)
    .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error.message);
    throw new Error("Gagal memuat pesan chat.");
  }
  return data as ChatMessage[];
}

export async function markMessagesAsRead(senderId: string, receiverId: string) {
  const { error } = await supabase
    .from("chats")
    .update({ is_read: true })
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking messages as read:", error.message);
    throw new Error("Gagal menandai pesan sebagai sudah dibaca.");
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("chats")
    .select("id", { count: "exact" })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread message count:", error.message);
    return 0;
  }
  return data?.length || 0;
}

export async function getChatParticipants(adminId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      sender_id,
      receiver_id,
      message,
      created_at,
      is_read
    `)
    .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching chat participants:", error);
    return [];
  }

  const conversationsMap = new Map<string, { latestMessage: string; latestTimestamp: string; otherUserId: string; unreadCount: number }>();

  for (const chat of data) {
    const otherUserId = chat.sender_id === adminId ? chat.receiver_id : chat.sender_id;
    
    // Initialize or update conversation for this otherUserId
    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, {
        latestMessage: chat.message,
        latestTimestamp: chat.created_at,
        otherUserId: otherUserId,
        unreadCount: 0,
      });
    }

    const currentConversation = conversationsMap.get(otherUserId)!;

    // Update latest message if this chat is newer
    if (new Date(chat.created_at) > new Date(currentConversation.latestTimestamp)) {
      currentConversation.latestMessage = chat.message;
      currentConversation.latestTimestamp = chat.created_at;
    }

    // Increment unread count if the message is for the admin and unread
    if (chat.receiver_id === adminId && !chat.is_read) {
      currentConversation.unreadCount++;
    }
  }

  const participantIds = Array.from(conversationsMap.keys());

  if (participantIds.length === 0) {
    return [];
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, email')
    .in('id', participantIds);

  if (profilesError) {
    console.error("Error fetching participant profiles:", profilesError);
    return [];
  }

  return profilesData.map(profile => ({
    ...profile,
    latestMessage: conversationsMap.get(profile.id)?.latestMessage || '',
    latestTimestamp: conversationsMap.get(profile.id)?.latestTimestamp || '',
    unreadCount: conversationsMap.get(profile.id)?.unreadCount || 0,
  }));
}