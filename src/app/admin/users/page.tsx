"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllProfiles, Profile } from "@/lib/supabase/profiles"; // Import dari modul profiles
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      const fetchedUsers = await getAllProfiles();
      setUsers(fetchedUsers);
      setIsLoading(false);
    }
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setIsUpdatingRole(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success(`Peran pengguna berhasil diperbarui menjadi ${newRole}.`);
    } catch (error: any) {
      toast.error("Gagal memperbarui peran pengguna: " + error.message);
    } finally {
      setIsUpdatingRole(null);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Manajemen Pengguna</h2>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[150px]">Peran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Belum ada pengguna yang terdaftar.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.first_name ? user.first_name[0].toUpperCase() : <UserIcon className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.first_name || "N/A"} {user.last_name || ""}
                      </TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: 'user' | 'admin') => handleRoleChange(user.id, value)}
                          disabled={isUpdatingRole === user.id}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Pilih Peran" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {isUpdatingRole === user.id && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin inline-block" />
                        )}
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