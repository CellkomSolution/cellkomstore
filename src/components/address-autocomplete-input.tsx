"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useGoogleMapsLoader } from "@/hooks/use-google-maps-loader";

// import "google.maps"; // Dihapus: Ini menyebabkan kesalahan 'Module not found'

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
  const { isLoaded: isApiLoaded, isLoading: isLoaderLoading } = useGoogleMapsLoader({ libraries: ["places"] });

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
        disabled={disabled || isLoaderLoading}
        className="pr-10"
      />
      {isLoaderLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}