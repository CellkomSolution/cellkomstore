"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPaymentMethods, deletePaymentMethod, PaymentMethod } from "@/lib/supabase/payment-methods";
import { Edit, Trash2, PlusCircle, Loader2, Banknote, CreditCard, Wallet } from "lucide-react";
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
import Image from "next/image";

export default function AdminPaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [methodToDelete, setMethodToDelete] = React.useState<PaymentMethod | null>(null);

  React.useEffect(() => {
    async function fetchPaymentMethods() {
      setIsLoading(true);
      const fetchedMethods = await getPaymentMethods(false); // Fetch all, including inactive
      setPaymentMethods(fetchedMethods);
      setIsLoading(false);
    }
    fetchPaymentMethods();
  }, []);

  const handleDeleteMethod = async () => {
    if (!methodToDelete) return;

    setIsDeleting(true);
    try {
      await deletePaymentMethod(methodToDelete.id);

      setPaymentMethods((prevMethods) =>
        prevMethods.filter((method) => method.id !== methodToDelete.id)
      );
      toast.success("Metode pembayaran berhasil dihapus!");
    } catch (error: any) {
      toast.error("Gagal menghapus metode pembayaran: " + error.message);
    } finally {
      setIsDeleting(false);
      setMethodToDelete(null);
    }
  };

  const getMethodDisplay = (method: PaymentMethod) => {
    if (method.image_url) {
      return (
        <Image
          src={method.image_url}
          alt={method.name}
          width={40}
          height={40}
          className="object-contain rounded"
        />
      );
    }
    switch (method.type) {
      case 'bank_transfer': return <Banknote className="h-5 w-5 text-muted-foreground" />;
      case 'e_wallet': return <Wallet className="h-5 w-5 text-muted-foreground" />;
      case 'card': return <CreditCard className="h-5 w-5 text-muted-foreground" />;
      default: return <Banknote className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getDetailsDisplay = (method: PaymentMethod) => {
    if (!method.details) return "N/A";

    if (method.type === 'bank_transfer' && typeof method.details === 'object') {
      return (
        <div className="text-xs">
          <p>Bank: {method.details.bank_name}</p>
          <p>A/N: {method.details.account_name}</p>
          <p>No. Rek: {method.details.account_number}</p>
        </div>
      );
    }
    if (method.type === 'e_wallet' && typeof method.details === 'object') {
      return (
        <div className="text-xs">
          <p>E-Wallet: {method.details.e_wallet_name}</p>
          <p>ID: {method.details.phone_number_or_id}</p>
        </div>
      );
    }
    if (method.type === 'card' && typeof method.details === 'object') {
      return (
        <div className="text-xs">
          <p>Tipe: {method.details.card_type}</p>
          {method.details.last_four_digits && <p>**** {method.details.last_four_digits}</p>}
        </div>
      );
    }
    // Fallback for 'other' type or malformed JSON
    return typeof method.details === 'string' ? method.details : JSON.stringify(method.details);
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manajemen Metode Pembayaran</h2>
        <Button asChild>
          <Link href="/admin/payment-methods/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Metode Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Logo</TableHead>
                  <TableHead>Nama Metode</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paymentMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada metode pembayaran yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="text-center">{getMethodDisplay(method)}</TableCell>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>{method.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</TableCell>
                      <TableCell>{getDetailsDisplay(method)}</TableCell>
                      <TableCell>
                        <Badge variant={method.is_active ? "success" : "secondary"}>
                          {method.is_active ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{method.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/payment-methods/edit/${method.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setMethodToDelete(method)}
                                disabled={isDeleting}
                              >
                                {isDeleting && methodToDelete?.id === method.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </AlertDialogTrigger>
                            {methodToDelete?.id === method.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus metode pembayaran{" "}
                                    <span className="font-semibold">{methodToDelete.name}</span>{" "}
                                    secara permanen dari database Anda.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteMethod}
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