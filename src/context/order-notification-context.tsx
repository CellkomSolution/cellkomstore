"use client";

import React, { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { Order } from "@/lib/supabase/orders"; // Import Order type
import { Clock, Package, CheckCircle, XCircle } from "lucide-react"; // Import icons

interface OrderNotificationProviderProps {
  children: React.ReactNode;
}

export function OrderNotificationProvider({ children }: OrderNotificationProviderProps) {
  const { user, isLoading: isSessionLoading } = useSession();

  const getStatusMessage = useCallback((status: Order['status']) => {
    switch (status) {
      case 'pending':
        return "menunggu pembayaran";
      case 'processing':
        return "sedang diproses";
      case 'completed':
        return "telah selesai";
      case 'cancelled':
        return "dibatalkan";
      default:
        return status;
    }
  }, []);

  const getStatusIcon = useCallback((status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  }, []);

  useEffect(() => {
    if (!isSessionLoading && user) {
      const userId = user.id;
      const channel = supabase
        .channel(`order_updates_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const oldRecord = payload.old as Order;
            const newRecord = payload.new as Order;

            if (newRecord.status !== oldRecord.status) {
              toast.info(
                `Status pesanan #${newRecord.id.substring(0, 8)} Anda telah berubah menjadi ${getStatusMessage(newRecord.status)}.`,
                {
                  icon: getStatusIcon(newRecord.status), // Add icon here
                  action: {
                    label: "Lihat",
                    onClick: () => window.location.href = `/my-orders/${newRecord.id}`,
                  },
                }
              );
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newRecord = payload.new as Order;
            toast.success(
              `Pesanan baru Anda #${newRecord.id.substring(0, 8)} berhasil dibuat!`,
              {
                icon: <ShoppingBag className="h-4 w-4" />, // Add icon for new order
                action: {
                  label: "Lihat",
                  onClick: () => window.location.href = `/my-orders/${newRecord.id}`,
                },
              }
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSessionLoading, user, getStatusMessage, getStatusIcon]);

  return <>{children}</>;
}