"use client";

import * as React from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { AppSettings } from "@/lib/supabase/app-settings";

interface TopAnnouncementBarProps {
  appSettings: AppSettings | null;
}

export function TopAnnouncementBar({ appSettings }: TopAnnouncementBarProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 hidden md:block">
      <div className="container mx-auto px-4 py-1 flex justify-between items-center">
        <div className="flex space-x-4">
          {appSettings?.download_app_url && (
            <a href={appSettings.download_app_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <Download className="h-3 w-3" /> {appSettings.download_app_text || "Download Aplikasi"}
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:underline">
            Bantuan
          </a>
          {appSettings?.right_header_text_enabled && appSettings?.right_header_text_content && (
            appSettings.right_header_text_link ? (
              <Link href={appSettings.right_header_text_link} className="hover:underline">
                {appSettings.right_header_text_content}
              </Link>
            ) : (
              <span className="hover:underline">{appSettings.right_header_text_content}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}