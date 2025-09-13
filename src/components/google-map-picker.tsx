"use client";

import * as React from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";

interface GoogleMapPickerProps {
  center: { lat: number; lng: number };
  markerPosition?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  zoom?: number;
  className?: string;
}

export function GoogleMapPicker({
  center,
  markerPosition,
  onMapClick,
  zoom = 15,
  className,
}: GoogleMapPickerProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const markerInstanceRef = React.useRef<google.maps.Marker | null>(null);
  const [isApiLoaded, setIsApiLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loader = new GoogleMapsLoader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
    });

    loader.load().then(() => {
      setIsApiLoaded(true);
      setIsLoading(false);
    }).catch((e) => {
      console.error("Error loading Google Maps API:", e);
      toast.error("Gagal memuat peta. Periksa kunci API Anda.");
      setIsLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (isApiLoaded && mapRef.current) {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapId: "YOUR_MAP_ID", // Anda bisa membuat Map ID di Google Cloud Console
          disableDefaultUI: true, // Sembunyikan UI default
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        if (onMapClick) {
          mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }
      } else {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }

      // Update marker position
      if (markerPosition) {
        if (!markerInstanceRef.current) {
          markerInstanceRef.current = new google.maps.Marker({
            map: mapInstanceRef.current,
            position: markerPosition,
          });
        } else {
          markerInstanceRef.current.setPosition(markerPosition);
        }
      } else if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null); // Remove marker if no position
        markerInstanceRef.current = null;
      }
    }
  }, [isApiLoaded, center, markerPosition, zoom, onMapClick]);

  return (
    <div className={`relative w-full h-64 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}