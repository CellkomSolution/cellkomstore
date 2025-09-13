"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";

interface AddressAutocompleteInputProps {
  onPlaceSelect: (place: {
    address: string;
    lat: number;
    lng: number;
    city?: string;
    postalCode?: string;
  }) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export function AddressAutocompleteInput({
  onPlaceSelect,
  defaultValue,
  disabled,
}: AddressAutocompleteInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
  const [isApiLoaded, setIsApiLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loader = new GoogleMapsLoader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      setIsApiLoaded(true);
      setIsLoading(false);
    }).catch((e) => {
      console.error("Error loading Google Maps Places API:", e);
      toast.error("Gagal memuat layanan peta. Periksa kunci API Anda.");
      setIsLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (isApiLoaded && inputRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "id" }, // Batasi ke Indonesia
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location && place.formatted_address) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          let city: string | undefined;
          let postalCode: string | undefined;

          for (const component of place.address_components || []) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (component.types.includes("postal_code")) {
              postalCode = component.long_name;
            }
          }

          onPlaceSelect({
            address: place.formatted_address,
            lat,
            lng,
            city,
            postalCode,
          });
        } else {
          toast.error("Tidak dapat menemukan detail untuk alamat yang dipilih.");
        }
      });
    }
  }, [isApiLoaded, onPlaceSelect]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder="Cari alamat Anda..."
        defaultValue={defaultValue}
        disabled={disabled || isLoading}
        className="pr-10"
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}