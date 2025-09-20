"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationListContent } from "./notification-list-content";

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationSheet({ open, onOpenChange }: NotificationSheetProps) {
  const isMobile = useIsMobile();

  const Content = (
    <>
      <SheetHeader className="px-6 pb-4 border-b">
        <SheetTitle className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifikasi Anda
        </SheetTitle>
      </SheetHeader>
      <NotificationListContent onNotificationClick={() => onOpenChange(false)} />
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[80vh] flex flex-col">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        {Content}
      </SheetContent>
    </Sheet>
  );
}