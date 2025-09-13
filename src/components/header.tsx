"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import { Marquee } from "@/components/ui/marquee";

export const Header = () => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      const settings = await getAppSettings();
      setAppSettings(settings);
      setIsLoadingSettings(false);
    };
    fetchSettings();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      {appSettings?.scrolling_text_enabled || appSettings?.right_header_text_enabled ? (
        <div className="bg-background border-t text-sm font-bold text-foreground"> {/* Perubahan di sini */}
          <div className="container mx-auto px-4 py-2 flex justify-between items-center overflow-hidden">
            {isLoadingSettings ? (
              <div className="flex-1 flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ) : (
              <>
                {appSettings?.scrolling_text_enabled && appSettings.scrolling_text_content && (
                  <Marquee className="flex-1">
                    <p className="mr-4">{appSettings.scrolling_text_content}</p>
                  </Marquee>
                )}
                {appSettings?.right_header_text_enabled && appSettings.right_header_text_content && (
                  <Link href={appSettings.right_header_text_link || "#"} className="ml-4 flex-shrink-0">
                    <p>{appSettings.right_header_text_content}</p>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
      {/* ... rest of the header content */}
    </header>
  );
};