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
import { LogOut } from "lucide-react"; // Menghapus import User icon
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserNav() {
  const { user, signOut, isLoading } = useSession();
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

  if (!user) {
    // Jika pengguna tidak login, komponen ini tidak akan menampilkan apa pun.
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || "/placeholder-avatar.jpg"} alt={user.first_name || "User"} />
            <AvatarFallback>{user.first_name ? user.first_name[0] : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">Dasbor Admin</Link>
          </DropdownMenuItem>
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