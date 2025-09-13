"use client";

import * as React from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useGoogleMapsLoader } from "@/hooks/use-google-maps-loader"; // Import hook baru

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
  const { isLoaded: isApiLoaded, isLoading: isLoaderLoading } = useGoogleMapsLoader(); // Gunakan hook baru

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
      {isLoaderLoading && ( // Gunakan isLoaderLoading dari hook
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}