"use client";

import { useSession } from "@/context/session-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserNav() {
  const { user, profile, signOut, isLoading } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Berhasil keluar.");
      router.push("/auth");
    } catch (error: any) {
      toast.error("Gagal keluar: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user || !profile) {
    // Jika pengguna tidak login, komponen ini tidak akan menampilkan apa pun.
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || "/placeholder-avatar.jpg"} alt={profile.first_name || "User"} />
            <AvatarFallback>{profile.first_name ? profile.first_name[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.first_name} {profile.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profil</Link>
          </DropdownMenuItem>
          {profile.role !== 'admin' && (
            <DropdownMenuItem asChild>
              <Link href="/my-orders">Pesanan Saya</Link>
            </DropdownMenuItem>
          )}
          {profile.role === 'admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/orders">Pesanan Masuk</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">Dasbor Admin</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}