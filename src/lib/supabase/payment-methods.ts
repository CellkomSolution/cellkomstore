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
  image_url: string | null; // New field for logo
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
    .insert({
      ...methodData,
      image_url: methodData.image_url ?? null, // Ensure null if empty string
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment method:", error.message);
    throw error;
  }
  return data;
}

export async function updatePaymentMethod(id: string, methodData: Partial<Omit<PaymentMethod, 'id' | 'created_at'>>): Promise<PaymentMethod | null> {
  const updatePayload: Partial<Omit<PaymentMethod, 'id' | 'created_at'>> = {
    ...methodData,
    updated_at: new Date().toISOString(),
  };

  // Ensure nullable fields are set to null if empty string
  if (updatePayload.image_url === "") updatePayload.image_url = null;

  const { data, error } = await supabase
    .from("payment_methods")
    .update(updatePayload)
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
  // First, get the method to retrieve its image_url
  const { data: methodToDelete, error: fetchError } = await supabase
    .from("payment_methods")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(`Error fetching payment method for deletion with ID ${id}:`, fetchError.message || fetchError);
    throw fetchError;
  }

  // If an image_url exists, delete the image from storage
  if (methodToDelete?.image_url) {
    const imageUrlParts = methodToDelete.image_url.split('/');
    const fileName = imageUrlParts[imageUrlParts.length - 1];
    const { error: storageError } = await supabase.storage
      .from('app-assets') // Changed to 'app-assets'
      .remove([fileName]);

    if (storageError) {
      console.warn("Failed to delete payment method image from storage:", storageError.message);
      // Don't throw error here, proceed with method deletion even if image deletion fails
    }
  }

  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting payment method with ID ${id}:`, error.message);
    throw error;
  }
}