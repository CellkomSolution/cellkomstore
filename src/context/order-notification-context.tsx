"use client";

import React, { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { Order } from "@/lib/supabase/orders"; // Import Order type
import { Clock, Package, CheckCircle, XCircle, ShoppingBag, BellRing, ReceiptText } from "lucide-react"; // Import icons, including ShoppingBag and BellRing
import { useAdmin } from "@/hooks/use-admin"; // Import useAdmin
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah
import { createNotification } from "@/lib/supabase/notifications"; // Import createNotification
import { getAdminUserId } from "@/lib/supabase/profiles"; // Import getAdminUserId

interface OrderNotificationProviderProps {
  children: React.ReactNode;
}

export function OrderNotificationProvider({ children }: OrderNotificationProviderProps) {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin(); // Get admin status
  const [adminUserId, setAdminUserId] = React.useState<string | null>(null); // New state for admin ID

  // Fetch admin user ID once
  React.useEffect(() => {
    async function fetchAdminId() {
      const id = await getAdminUserId();
      setAdminUserId(id);
    }
    fetchAdminId();
  }, []);

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
    if (isSessionLoading || isAdminLoading || (isAdmin && !adminUserId)) { // Wait for adminUserId if current user is admin
      console.log("OrderNotificationProvider: Skipping setup due to loading or admin status.");
      return;
    }

    // --- Notifikasi pesanan khusus pengguna (perubahan status & pesanan baru oleh pengguna ini) ---
    if (user && !isAdmin) { // Hanya untuk pengguna biasa
      const userId = user.id;
      console.log(`OrderNotificationProvider: Subscribing user ${userId} to order updates.`);
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
          async (payload) => {
            const oldRecord = payload.old as Order;
            const newRecord = payload.new as Order;
            console.log(`OrderNotificationProvider (User ${userId}): Order UPDATE received. Old:`, oldRecord, "New:", newRecord);

            // Notify on order_status change
            if (newRecord.order_status !== oldRecord.order_status) {
              const title = `Status Pesanan #${newRecord.id.substring(0, 8)} Diperbarui`;
              const message = `Pesanan Anda sekarang ${getOrderStatusMessage(newRecord.order_status)}.`;
              const link = `/my-orders/${newRecord.id}`;
              
              console.log(`OrderNotificationProvider (User ${userId}): Creating order_status_update notification.`);
              await createNotification(userId, 'order_status_update', title, message, link, null, newRecord.id); // Pass order_id
              toast.info(message, {
                icon: getStatusIcon(newRecord.order_status, newRecord.payment_status),
                action: {
                  label: "Lihat",
                  onClick: () => window.location.href = link,
                },
              });
            }
            // Notify on payment_status change (e.g., admin confirmed payment)
            if (newRecord.payment_status !== oldRecord.payment_status && newRecord.payment_status === 'paid') {
              const title = `Pembayaran Pesanan #${newRecord.id.substring(0, 8)} Dikonfirmasi`;
              const message = `Pembayaran Anda sudah diterima, pesanan Anda sedang diproses.`; 
              const link = `/my-orders/${newRecord.id}`;

              console.log(`OrderNotificationProvider (User ${userId}): Creating payment_status_update notification.`);
              await createNotification(userId, 'payment_status_update', title, message, link, null, newRecord.id); // Pass order_id
              toast.success(message, {
                icon: getStatusIcon(newRecord.order_status, newRecord.payment_status),
                action: {
                  label: "Lihat",
                  onClick: () => window.location.href = link,
                },
              });
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
          async (payload) => { // Make async to use await createNotification
            const newRecord = payload.new as Order;
            console.log(`OrderNotificationProvider (User ${userId}): Order INSERT received. New:`, newRecord);
            const title = `Pesanan Baru #${newRecord.id.substring(0, 8)}`;
            const message = `Pesanan Anda berhasil dibuat! Total: ${formatRupiah(newRecord.total_amount + newRecord.payment_unique_code)}.`;
            const link = `/my-orders/${newRecord.id}`;

            console.log(`OrderNotificationProvider (User ${userId}): Creating new order notification.`);
            await createNotification(userId, 'order_status_update', title, message, link, null, newRecord.id); // Pass order_id
            toast.success(message, {
              icon: <ShoppingBag className="h-4 w-4" />,
              action: {
                label: "Lihat",
                onClick: () => window.location.href = link,
              },
            });
          }
        )
        .subscribe();

      return () => {
        console.log(`OrderNotificationProvider: Unsubscribing user ${userId} from order updates.`);
        supabase.removeChannel(userOrderChannel);
      };
    }

    // --- Notifikasi khusus admin (pesanan baru dari pengguna mana pun & perubahan status pembayaran) ---
    if (user && isAdmin && adminUserId) { // Hanya untuk pengguna admin
      console.log(`OrderNotificationProvider: Subscribing admin ${adminUserId} to all order notifications.`);
      const adminOrderChannel = supabase
        .channel(`admin_order_notifications`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            // Admin harus melihat semua pesanan baru
          },
          async (payload) => { // Make async to use await createNotification
            const newRecord = payload.new as Order;
            console.log(`OrderNotificationProvider (Admin ${adminUserId}): Order INSERT received. New:`, newRecord);
            const title = `Pesanan Baru #${newRecord.id.substring(0, 8)}`;
            const message = `Pesanan baru masuk! Total: ${formatRupiah(newRecord.total_amount + newRecord.payment_unique_code)}.`;
            const link = `/admin/orders/${newRecord.id}`;

            // Create persistent notification for admin
            console.log(`OrderNotificationProvider (Admin ${adminUserId}): Creating new order notification for admin.`);
            await createNotification(adminUserId, 'order_status_update', title, message, link, null, newRecord.id); // Pass order_id

            toast.info(message, {
              icon: <BellRing className="h-4 w-4" />,
              action: {
                label: "Lihat",
                onClick: () => window.location.href = link,
              },
              duration: 8000,
            });
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
          async (payload) => { // Make async
            const oldRecord = payload.old as Order;
            const newRecord = payload.new as Order;
            console.log(`OrderNotificationProvider (Admin ${adminUserId}): Order UPDATE (awaiting_confirmation) received. Old:`, oldRecord, "New:", newRecord);

            if (newRecord.payment_status === 'awaiting_confirmation' && oldRecord.payment_status === 'unpaid') {
              const title = `Konfirmasi Pembayaran Pesanan #${newRecord.id.substring(0, 8)}`;
              const message = `Pembayaran pesanan menunggu konfirmasi! Kode unik: ${newRecord.payment_unique_code}.`;
              const link = `/admin/orders/${newRecord.id}`;

              // Create persistent notification for admin
              console.log(`OrderNotificationProvider (Admin ${adminUserId}): Creating payment_status_update notification for admin.`);
              await createNotification(adminUserId, 'payment_status_update', title, message, link, null, newRecord.id); // Pass order_id

              toast.warning(message, {
                icon: <ReceiptText className="h-4 w-4" />,
                action: {
                  label: "Cek",
                  onClick: () => window.location.href = link,
                },
                duration: 10000,
              });
            }
          }
        )
        .subscribe();

      return () => {
        console.log(`OrderNotificationProvider: Unsubscribing admin ${adminUserId} from order notifications.`);
        supabase.removeChannel(adminOrderChannel);
      };
    }

  }, [isSessionLoading, isAdminLoading, user, isAdmin, adminUserId, getOrderStatusMessage, getPaymentStatusMessage, getStatusIcon]);

  return <>{children}</>;
}