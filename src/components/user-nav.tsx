"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/context/session-context";
import { useAdmin } from "@/hooks/use-admin";

export function UserNav() {
  const { session, user, profile, signOut, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isAdminLoading } = useAdmin();

  if (isSessionLoading || isAdminLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.first_name
                    ? profile.first_name[0].toUpperCase()
                    : user?.email
                    ? user.email[0].toUpperCase()
                    : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Akun</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-orders" className="cursor-pointer">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Pesanan Saya</span>
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dasbor Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/auth">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">Daftar</Link>
          </Button>
        </div>
      )}
      <Button variant="ghost" size="icon" className="md:hidden" asChild>
        <Link href="/auth">
          <User className="h-6 w-6" />
          <span className="sr-only">Akun</span>
        </Link>
      </Button>
    </>
  );
}