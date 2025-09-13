"use client";

import * as React from "react";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";
import { toast } from "sonner";

interface UseGoogleMapsLoaderOptions {
  libraries?: ("places" | "geometry" | "drawing" | "visualization")[];
}

let googleMapsLoaderInstance: GoogleMapsLoader | null = null;
let googleMapsLoadPromise: Promise<typeof google> | null = null;

export function useGoogleMapsLoader(options?: UseGoogleMapsLoaderOptions) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Cara yang benar untuk mengakses variabel lingkungan di Next.js
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_AIzaSyBjkMJjjyUCe9kFwfjNNCZyah1XAwUGpkA;

    if (!apiKey) {
      const err = new Error("Google Maps API Key tidak ditemukan. Harap atur variabel lingkungan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      console.error(err);
      toast.error(err.message);
      setError(err);
      setIsLoading(false);
      return;
    }

    if (!googleMapsLoaderInstance) {
      googleMapsLoaderInstance = new GoogleMapsLoader({
        apiKey: apikey,
        version: "weekly",
        libraries: ["places"],
        id: "__googleMapsScriptId",
      });
      googleMapsLoadPromise = googleMapsLoaderInstance.load();
    }

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
  }, []);

  return { isLoaded, isLoading, error };
}