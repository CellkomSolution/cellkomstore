import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'e_wallet' | 'card' | 'other';
  details: any; // JSONB field for specific details
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function getPaymentMethods(onlyActive: boolean = true): Promise<PaymentMethod[]> {
  let query = supabase
    .from("payment_methods")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching payment methods:", error.message);
    return [];
  }
  return data;
}

export async function getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching payment method with ID ${id}:`, error.message);
    return null;
  }
  return data;
}

export async function createPaymentMethod(methodData: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from("payment_methods")
    .insert(methodData)
    .select()
    .single();

  if (error) {
    console.error("Error creating payment method:", error.message);
    throw error;
  }
  return data;
}

export async function updatePaymentMethod(id: string, methodData: Partial<Omit<PaymentMethod, 'id' | 'created_at'>>): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from("payment_methods")
    .update({ ...methodData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating payment method with ID ${id}:`, error.message);
    throw error;
  }
  return data;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting payment method with ID ${id}:`, error.message);
    throw error;
  }
}