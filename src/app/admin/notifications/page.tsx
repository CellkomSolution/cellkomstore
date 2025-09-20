"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getNotifications, deleteNotification, Notification } from "@/lib/supabase/notifications";
import { Edit, Trash2, PlusCircle, Loader2, Bell, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSession } from "@/context/session-context";

export default function AdminNotificationsPage() {
  const { user: adminUser } = useSession();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [notificationToDelete, setNotificationToDelete] = React.useState<Notification | null>(null);

  React.useEffect(() => {
    async function fetchNotifications() {
      setIsLoading(true);
      // Admin can view all notifications, so we pass a dummy user_id or handle in policy
      // For simplicity, we'll fetch all and rely on RLS for actual access
      const fetchedNotifications = await getNotifications(adminUser?.id || ''); // Pass admin's ID for policy check
      setNotifications(fetchedNotifications);
      setIsLoading(false);
    }
    fetchNotifications();
  }, [adminUser]);

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteNotification(notificationToDelete.id);

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.id !== notificationToDelete.id)
      );
      toast.success("Notifikasi berhasil dihapus!");
    } catch (error: any) {
      toast.error("Gagal menghapus notifikasi: " + error.message);
    } finally {
      setIsDeleting(false);
      setNotificationToDelete(null);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manajemen Notifikasi</h2>
        <Button asChild>
          <Link href="/admin/notifications/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Kirim Notifikasi Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Status</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Penerima</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada notifikasi yang dikirim.
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell>
                        <Badge variant={notif.is_read ? "secondary" : "default"}>
                          {notif.is_read ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          <span className="sr-only">{notif.is_read ? "Dibaca" : "Belum Dibaca"}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{notif.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{notif.message}</TableCell>
                      <TableCell>{notif.user_profile?.first_name || notif.user_profile?.email || "N/A"}</TableCell>
                      <TableCell>{format(new Date(notif.created_at), "dd MMM yyyy, HH:mm", { locale: id })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/notifications/edit/${notif.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setNotificationToDelete(notif)}
                                disabled={isDeleting}
                              >
                                {isDeleting && notificationToDelete?.id === notif.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </AlertDialogTrigger>
                            {notificationToDelete?.id === notif.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus notifikasi{" "}
                                    <span className="font-semibold">{notificationToDelete.title}</span>{" "}
                                    secara permanen dari database Anda.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteNotification}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}