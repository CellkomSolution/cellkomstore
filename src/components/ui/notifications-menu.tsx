"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notification as SupabaseNotification } from "@/lib/supabase/notifications";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Bell, CheckCircle, Package, MessageSquare, Tag, Loader2 } from "lucide-react";

interface NotificationItemProps {
  notification: SupabaseNotification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIconForType = (type: SupabaseNotification['type']) => {
    switch (type) {
      case 'order_status_update':
      case 'payment_status_update':
        return <Package className="h-5 w-5 text-primary" />;
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'promotion':
        return <Tag className="h-5 w-5 text-green-500" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleItemClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link; // Use window.location.href for full page navigation
    }
  };

  return (
    <div className="w-full py-4 first:pt-0 last:pb-0 cursor-pointer" onClick={handleItemClick}>
      <div className="flex gap-3">
        <div className="size-11 flex items-center justify-center rounded-full bg-muted shrink-0">
          {getIconForType(notification.type)}
        </div>

        <div className="flex flex-1 flex-col space-y-1">
          <div className="w-full items-start">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">
                <span className="font-medium">{notification.title}</span>
              </div>
              {!notification.is_read && (
                <div className="size-1.5 rounded-full bg-emerald-500"></div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="mt-0.5 text-xs text-muted-foreground">
                {notification.message}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: localeId })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const NotificationsPageContent = ({
  notifications: initialNotifications,
  onMarkAllAsRead,
  onMarkAsRead,
  isLoading,
}: {
  notifications: SupabaseNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  isLoading: boolean;
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const allNotifications = initialNotifications;
  const unreadNotifications = initialNotifications.filter(n => !n.is_read);

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return unreadNotifications;
      default:
        return allNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Card className="flex w-full flex-col gap-6 p-4 shadow-none md:p-8">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base leading-none font-semibold tracking-[-0.006em]">
            Notifikasi Anda
          </h3>
          <div className="flex items-center gap-2">
            <Button className="size-8" variant="ghost" size="icon" onClick={onMarkAllAsRead} disabled={unreadNotifications.length === 0}>
              <CheckCircle className="size-4.5 text-muted-foreground" />
              <span className="sr-only">Tandai semua dibaca</span>
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-col justify-start"
        >
          <div className="flex items-center justify-between">
            <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 [&_button]:gap-1.5">
              <TabsTrigger value="all">
                Semua
                <Badge variant="secondary">{allNotifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Belum Dibaca <Badge variant="secondary">{unreadNotifications.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </CardHeader>

      <CardContent className="h-full p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium tracking-[-0.006em] text-muted-foreground">
              Memuat notifikasi...
            </p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-0 divide-y divide-dashed divide-border">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2.5 py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Bell className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium tracking-[-0.006em] text-muted-foreground">
              Tidak ada notifikasi.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};