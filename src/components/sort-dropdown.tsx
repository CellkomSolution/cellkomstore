"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SortOption } from "@/lib/supabase/products"; // Import SortOption dari modul products

interface SortDropdownProps {
  onSortChange: (value: SortOption) => void;
  defaultValue?: SortOption;
}

export function SortDropdown({ onSortChange, defaultValue = 'newest' }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Urutkan:</span>
      <Select onValueChange={onSortChange} defaultValue={defaultValue}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih urutan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="popularity">Populer</SelectItem>
          <SelectItem value="price-asc">Harga: Rendah ke Tinggi</SelectItem>
          <SelectItem value="price-desc">Harga: Tinggi ke Rendah</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}