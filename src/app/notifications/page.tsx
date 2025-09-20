"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationListContent } from "@/components/notification-list-content";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Semua Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <NotificationListContent />
        </CardContent>
      </Card>
    </div>
  );
}