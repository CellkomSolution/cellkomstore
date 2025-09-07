export interface Product {
  id: string; // Mengubah tipe ID menjadi string karena UUID dari Supabase
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  location: string;
  rating: number;
  soldCount: string;
  category: string;
  isFlashSale?: boolean; // Menambahkan properti isFlashSale
}

// Data mock telah dipindahkan ke Supabase, jadi kita tidak lagi mengekspor array ini.
// Interface Product tetap di sini karena digunakan oleh komponen lain.