import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  product_id: string | null;
  is_read: boolean;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
  };
  products?: {
    name: string;
    image_url: string;
  };
}

export interface ChatConversation {
  user_id: string;
  user_first_name: string | null;
  user_last_name: string | null;
  user_avatar_url: string | null;
  product_id: string | null;
  product_name: string | null;
  product_image_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export async function getChatConversations(adminId: string): Promise<ChatConversation[]> {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      sender_id,
      receiver_id,
      product_id,
      message,
      created_at,
      is_read,
      profiles!sender_id (first_name, last_name, avatar_url),
      products (name, image_url)
    `)
    .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching chat conversations:", error.message || error);
    return [];
  }

  const conversationsMap = new Map<string, ChatConversation>();

  for (const chat of data) {
    const otherParticipantId = chat.sender_id === adminId ? chat.receiver_id : chat.sender_id;
    const conversationKey = `${otherParticipantId}-${chat.product_id || 'general'}`;

    if (!conversationsMap.has(conversationKey)) {
      const userProfile = chat.profiles;
      const productInfo = chat.products;

      conversationsMap.set(conversationKey, {
        user_id: otherParticipantId,
        user_first_name: userProfile?.first_name || null,
        user_last_name: userProfile?.last_name || null,
        user_avatar_url: userProfile?.avatar_url || null,
        product_id: chat.product_id,
        product_name: productInfo?.name || null,
        product_image_url: productInfo?.image_url || null,
        last_message: chat.message,
        last_message_time: chat.created_at,
        unread_count: 0,
      });
    }

    const conversation = conversationsMap.get(conversationKey)!;
    if (chat.receiver_id === adminId && !chat.is_read) {
      conversation.unread_count++;
    }
  }

  return Array.from(conversationsMap.values()).sort((a, b) =>
    new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  );
}

export async function getChatMessages(userId: string, adminId: string, productId: string | null): Promise<ChatMessage[]> {
  let query = supabase
    .from("chats")
    .select(`
      *,
      profiles (first_name, last_name, avatar_url, role)
    `)
    .order("created_at", { ascending: true });

  if (productId) {
    query = query.eq("product_id", productId);
  } else {
    query = query.is("product_id", null);
  }

  query = query.or(`(sender_id.eq.${userId},receiver_id.eq.${adminId}),(sender_id.eq.${adminId},receiver_id.eq.${userId})`);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching chat messages:", error.message || error);
    return [];
  }
  return data as ChatMessage[];
}

export async function markMessagesAsRead(userId: string, adminId: string, productId: string | null): Promise<void> {
  let query = supabase
    .from("chats")
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq("sender_id", userId)
    .eq("receiver_id", adminId)
    .eq("is_read", false);

  if (productId) {
    query = query.eq("product_id", productId);
  } else {
    query = query.is("product_id", null);
  }

  const { error } = await query;

  if (error) {
    console.error("Error marking messages as read:", error.message || error);
    throw error;
  }
}