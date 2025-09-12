import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./profiles"; // Import Profile interface
import { Product } from "./products"; // Import Product interface

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  product_id: string | null;
  is_read: boolean;
  updated_at: string; // Menambahkan kolom updated_at
  sender_profile: Array<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
  }>;
  receiver_profile: Array<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
  }>;
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

// Define a specific interface for the data returned by the select query in getChatConversations
interface RawChatData {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  updated_at: string; // Menambahkan kolom updated_at
  sender_profile: Array<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
  }>;
  receiver_profile: Array<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
  }>;
  products: Array<{
    name: string;
    image_url: string;
  }> | null;
}

export async function getChatConversations(adminId: string): Promise<ChatConversation[]> {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      sender_id,
      receiver_id,
      product_id,
      message,
      created_at,
      is_read,
      updated_at,
      sender_profile:profiles!sender_id (first_name, last_name, avatar_url, role),
      receiver_profile:profiles!receiver_id (first_name, last_name, avatar_url, role),
      products (name, image_url)
    `)
    .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching chat conversations:", error.message || error);
    return [];
  }

  const rawChats = data as RawChatData[];

  const conversationsMap = new Map<string, ChatConversation>();

  for (const chat of rawChats) {
    const otherParticipantId = chat.sender_id === adminId ? chat.receiver_id : chat.sender_id;
    const conversationKey = `${otherParticipantId}-${chat.product_id || 'general'}`;

    // Safely extract the first element from the profile arrays
    const senderProfile = chat.sender_profile && chat.sender_profile.length > 0 ? chat.sender_profile[0] : null;
    const receiverProfile = chat.receiver_profile && chat.receiver_profile.length > 0 ? chat.receiver_profile[0] : null;
    
    const otherParticipantProfile = chat.sender_id === otherParticipantId ? senderProfile : receiverProfile;

    // Safely access the first element of the products array
    const productData = chat.products && chat.products.length > 0 ? chat.products[0] : null;

    if (!conversationsMap.has(conversationKey)) {
      conversationsMap.set(conversationKey, {
        user_id: otherParticipantId,
        user_first_name: otherParticipantProfile?.first_name || null,
        user_last_name: otherParticipantProfile?.last_name || null,
        user_avatar_url: otherParticipantProfile?.avatar_url || null,
        product_id: chat.product_id,
        product_name: productData?.name || null,
        product_image_url: productData?.image_url || null,
        last_message: chat.message,
        last_message_time: chat.created_at,
        unread_count: 0,
      });
    }

    const conversation = conversationsMap.get(conversationKey)!;
    if (chat.receiver_id === adminId && chat.sender_id === otherParticipantId && !chat.is_read) {
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
      sender_profile:profiles!sender_id (first_name, last_name, avatar_url, role),
      receiver_profile:profiles!receiver_id (first_name, last_name, avatar_url, role)
    `)
    .order("created_at", { ascending: true });

  if (productId) {
    query = query.eq("product_id", productId);
  } else {
    query = query.is("product_id", null);
  }

  query = query.or(`and(sender_id.eq."${userId}",receiver_id.eq."${adminId}"),and(sender_id.eq."${adminId}",receiver_id.eq."${userId}")`);

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