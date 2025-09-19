"use client";

import React, { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { Order } from "@/lib/supabase/orders"; // Import Order type
import { Clock, Package, CheckCircle, XCircle, ShoppingBag, BellRing, ReceiptText } from "lucide-react"; // Import icons, including ShoppingBag and BellRing
import { useAdmin } from "@/hooks/use-admin"; // Import useAdmin
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah

interface OrderNotificationProviderProps {
  children: React.ReactNode;
}

export function OrderNotificationProvider({ children }: OrderNotificationProviderProps) {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin(); // Get admin status

  const getOrderStatusMessage = useCallback((status: Order['order_status']) => {
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

  const getPaymentStatusMessage = useCallback((status: Order['payment_status']) => {
    switch (status) {
      case 'unpaid':
        return "belum dibayar";
      case 'awaiting_confirmation':
        return "menunggu konfirmasi pembayaran";
      case 'paid':
        return "sudah dibayar";
      case 'refunded':
        return "dikembalikan";
      default:
        return status;
    }
  }, []);

  const getStatusIcon = useCallback((orderStatus: Order['order_status'], paymentStatus: Order['payment_status']) => {
    if (paymentStatus === 'awaiting_confirmation') return <ReceiptText className="h-4 w-4" />;
    if (paymentStatus === 'paid') return <CheckCircle className="h-4 w-4" />;
    if (paymentStatus === 'refunded') return <XCircle className="h-4 w-4" />;

    switch (orderStatus) {
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

            // Notify on order_status change
            if (newRecord.order_status !== oldRecord.order_status) {
              toast.info(
                `Status pesanan #${newRecord.id.substring(0, 8)} Anda telah berubah menjadi ${getOrderStatusMessage(newRecord.order_status)}.`,
                {
                  icon: getStatusIcon(newRecord.order_status, newRecord.payment_status),
                  action: {
                    label: "Lihat",
                    onClick: () => window.location.href = `/my-orders/${newRecord.id}`,
                  },
                }
              );
            }
            // Notify on payment_status change (e.g., admin confirmed payment)
            if (newRecord.payment_status !== oldRecord.payment_status && newRecord.payment_status === 'paid') {
              toast.success(
                `Pembayaran pesanan #${newRecord.id.substring(0, 8)} Anda telah dikonfirmasi!`,
                {
                  icon: getStatusIcon(newRecord.order_status, newRecord.payment_status),
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

    // --- Notifikasi khusus admin (pesanan baru dari pengguna mana pun & perubahan status pembayaran) ---
    if (user && isAdmin) { // Hanya untuk pengguna admin
      const adminOrderChannel = supabase
        .channel(`admin_order_notifications`)
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
              `Pesanan baru #${newRecord.id.substring(0, 8)} masuk! Total: ${formatRupiah(newRecord.total_amount + newRecord.payment_unique_code)}.`,
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
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            // Admin needs to know when payment status changes to 'awaiting_confirmation'
            filter: `payment_status=eq.awaiting_confirmation`,
          },
          (payload) => {
            const oldRecord = payload.old as Order;
            const newRecord = payload.new as Order;

            if (newRecord.payment_status === 'awaiting_confirmation' && oldRecord.payment_status === 'unpaid') {
              toast.warning(
                `Pembayaran pesanan #${newRecord.id.substring(0, 8)} menunggu konfirmasi! Kode unik: ${newRecord.payment_unique_code}.`,
                {
                  icon: <ReceiptText className="h-4 w-4" />,
                  action: {
                    label: "Cek",
                    onClick: () => window.location.href = `/admin/orders/${newRecord.id}`,
                  },
                  duration: 10000, // Notifikasi ini lebih penting
                }
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(adminOrderChannel);
      };
    }

  }, [isSessionLoading, isAdminLoading, user, isAdmin, getOrderStatusMessage, getPaymentStatusMessage, getStatusIcon]);

  return <>{children}</>;
}