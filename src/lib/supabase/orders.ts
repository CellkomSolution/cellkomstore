import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/context/cart-context";
import { Profile } from "./profiles";
import { Product, mapProductData } from "./products";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price_at_purchase: number;
  product_name_at_purchase: string;
  product_image_url_at_purchase: string;
  created_at: string;
  product?: Product; // Joined product data
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_address_name: string;
  shipping_address_full: string;
  shipping_address_city: string;
  shipping_address_postal_code: string | null;
  shipping_address_latitude: number | null;
  shipping_address_longitude: number | null;
  contact_phone: string;
  payment_method_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: Profile; // Joined user profile data
  order_items?: OrderItem[]; // Joined order items
  payment_method?: { id: string; name: string; type: string; details: any }; // Joined payment method
}

export async function createOrder(
  userId: string,
  cartItems: CartItem[],
  shippingInfo: {
    name: string;
    fullAddress: string;
    city: string;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string;
  }
): Promise<Order | null> {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address_name: shippingInfo.name,
      shipping_address_full: shippingInfo.fullAddress,
      shipping_address_city: shippingInfo.city,
      shipping_address_postal_code: shippingInfo.postalCode,
      shipping_address_latitude: shippingInfo.latitude,
      shipping_address_longitude: shippingInfo.longitude,
      contact_phone: shippingInfo.phone,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError.message);
    throw new Error("Gagal membuat pesanan.");
  }

  const orderItemsToInsert = cartItems.map((item) => ({
    order_id: orderData.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_purchase: item.price,
    product_name_at_purchase: item.name,
    product_image_url_at_purchase: item.imageUrl,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsert);

  if (orderItemsError) {
    console.error("Error creating order items:", orderItemsError.message);
    // Consider rolling back the order if order items fail
    await supabase.from("orders").delete().eq("id", orderData.id);
    throw new Error("Gagal membuat item pesanan.");
  }

  return orderData as Order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      user_profile:profiles(id, first_name, last_name, avatar_url, email),
      order_items(*, products(id, name, price, original_price, image_url, location, rating, sold_count, category, is_flash_sale, description)),
      payment_method:payment_methods(id, name, type, details)
    `)
    .eq("id", orderId)
    .single();

  if (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error.message);
    return null;
  }

  if (!data) return null;

  // Map product data within order_items
  const mappedOrderItems = data.order_items?.map(item => ({
    ...item,
    product: item.products ? mapProductData(item.products) : undefined,
  }));

  return {
    ...data,
    user_profile: data.user_profile as Profile,
    order_items: mappedOrderItems as OrderItem[],
    payment_method: data.payment_method as { id: string; name: string; type: string; details: any } | undefined,
  } as Order;
}

export async function updateOrderPaymentMethod(orderId: string, paymentMethodId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_method_id: paymentMethodId, status: 'processing', updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating payment method for order ${orderId}:`, error.message);
    throw new Error("Gagal memperbarui metode pembayaran pesanan.");
  }
  return data as Order;
}

export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for order ${orderId}:`, error.message);
    throw new Error("Gagal memperbarui status pesanan.");
  }
  return data as Order;
}

export async function getOrders(status?: Order['status']): Promise<Order[]> {
  let query = supabase
    .from("orders")
    .select(`
      *,
      user_profile:profiles(id, first_name, last_name, avatar_url, email),
      payment_method:payment_methods(id, name, type)
    `)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error.message);
    return [];
  }

  return data.map(order => ({
    ...order,
    user_profile: order.user_profile as Profile,
    payment_method: order.payment_method as { id: string; name: string; type: string } | undefined,
  })) as Order[];
}

export async function getTotalOrdersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total orders count:", error.message || error);
    return 0;
  }
  return count || 0;
}