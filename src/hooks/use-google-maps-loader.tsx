"use client";

import * as React from "react";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";
import { toast } from "sonner";

// import "google.maps"; // Dihapus: Ini menyebabkan kesalahan 'Module not found'

interface UseGoogleMapsLoaderOptions {
  // Opsi ini masih bisa ada jika komponen ingin mendeklarasikan apa yang ingin mereka gunakan,
  // tetapi loader yang sebenarnya akan memuat set yang tetap untuk konsistensi.
  libraries?: ("places" | "geometry" | "drawing" | "visualization")[];
}

// Gunakan variabel global untuk menyimpan instance Loader tunggal dan promis-nya
// Ini memastikan bahwa ia hanya dibuat sekali dengan set opsi yang konsisten.
let googleMapsLoaderInstance: GoogleMapsLoader | null = null;
let googleMapsLoadPromise: Promise<typeof google> | null = null; // Tipe diubah di sini

export function useGoogleMapsLoader(options?: UseGoogleMapsLoaderOptions) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // --- DEBUGGING LOG ---
    console.log("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:", apiKey ? "Loaded (starts with: " + apiKey.substring(0, 5) + "...)" : "Not Loaded");
    // --- END DEBUGGING LOG ---

    if (!apiKey) {
      const err = new Error("Google Maps API Key tidak ditemukan. Harap atur variabel lingkungan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      console.error(err);
      toast.error(err.message);
      setError(err);
      setIsLoading(false);
      return;
    }

    // Inisialisasi loader hanya sekali
    if (!googleMapsLoaderInstance) {
      googleMapsLoaderInstance = new GoogleMapsLoader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"], // Selalu muat 'places' untuk konsistensi
        id: "__googleMapsScriptId", // Pastikan ID konsisten
      });
      googleMapsLoadPromise = googleMapsLoaderInstance.load();
    }

    // Tunggu promise pemuatan tunggal
    if (googleMapsLoadPromise) {
      googleMapsLoadPromise
        .then(() => {
          setIsLoaded(true);
          setIsLoading(false);
        })
        .catch((e) => {
          console.error("Error loading Google Maps API:", e);
          toast.error("Gagal memuat layanan peta. Periksa kunci API Anda.");
          setError(e);
          setIsLoading(false);
        });
    }
  }, []); // Array dependensi kosong memastikan ini hanya berjalan sekali saat mount

  return { isLoaded, isLoading, error };
}