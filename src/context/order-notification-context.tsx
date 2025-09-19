"use client";

import React, { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { Order } from "@/lib/supabase/orders"; // Import Order type
import { Clock, Package, CheckCircle, XCircle, ShoppingBag, BellRing } from "lucide-react"; // Import icons, including ShoppingBag and BellRing
import { useAdmin } from "@/hooks/use-admin"; // Import useAdmin
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah

interface OrderNotificationProviderProps {
  children: React.ReactNode;
}

export function OrderNotificationProvider({ children }: OrderNotificationProviderProps) {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin(); // Get admin status

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
    if (isSessionLoading || isAdminLoading) {
      return; // Tunggu hingga sesi dan status admin dimuat
    }

    // --- Notifikasi pesanan khusus pengguna (perubahan status & pesanan baru oleh pengguna ini) ---
    if (user && !isAdmin) { // Hanya untuk pengguna biasa
      const userId = user.id;
      const userOrderChannel = supabase
        .channel(`user_order_updates_${userId}`)
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
                  icon: getStatusIcon(newRecord.status),
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
                icon: <ShoppingBag className="h-4 w-4" />,
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
        supabase.removeChannel(userOrderChannel);
      };
    }

    // --- Notifikasi khusus admin (pesanan baru dari pengguna mana pun) ---
    if (user && isAdmin) { // Hanya untuk pengguna admin
      const adminOrderChannel = supabase
        .channel(`admin_new_orders`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            // Tidak perlu filter, admin harus melihat semua pesanan baru
          },
          (payload) => {
            const newRecord = payload.new as Order;
            toast.info(
              `Pesanan baru #${newRecord.id.substring(0, 8)} masuk! Total: ${formatRupiah(newRecord.total_amount)}.`,
              {
                icon: <BellRing className="h-4 w-4" />,
                action: {
                  label: "Lihat",
                  onClick: () => window.location.href = `/admin/orders/${newRecord.id}`,
                },
                duration: 8000, // Notifikasi admin sedikit lebih lama
              }
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(adminOrderChannel);
      };
    }

  }, [isSessionLoading, isAdminLoading, user, isAdmin, getStatusMessage, getStatusIcon]);

  return <>{children}</>;
}