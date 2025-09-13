"use client";

import * as React from "react";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";
import { toast } from "sonner";

interface UseGoogleMapsLoaderOptions {
  libraries?: ("places" | "geometry" | "drawing" | "visualization")[];
}

export function useGoogleMapsLoader(options?: UseGoogleMapsLoaderOptions) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const librariesToLoad = React.useMemo(() => {
    const uniqueLibraries = new Set<string>();
    if (options?.libraries) {
      options.libraries.forEach(lib => uniqueLibraries.add(lib));
    }
    // Always include 'places' if any component needs it, to avoid re-loading issues
    uniqueLibraries.add("places"); 
    return Array.from(uniqueLibraries) as ("places" | "geometry" | "drawing" | "visualization")[];
  }, [options?.libraries]);

  React.useEffect(() => {
    // Use a global flag or context to ensure the loader is only called once
    // This simple approach uses a global variable, but a React Context would be more robust for larger apps.
    if ((window as any).googleMapsApiLoaded) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    const loader = new GoogleMapsLoader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: librariesToLoad,
    });

    loader.load()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
        (window as any).googleMapsApiLoaded = true; // Set global flag
      })
      .catch((e) => {
        console.error("Error loading Google Maps API:", e);
        toast.error("Gagal memuat layanan peta. Periksa kunci API Anda.");
        setError(e);
        setIsLoading(false);
      });
  }, [librariesToLoad]);

  return { isLoaded, isLoading, error };
}