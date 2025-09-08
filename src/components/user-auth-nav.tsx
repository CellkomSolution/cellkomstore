"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/context/session-context";

export function UserAuthNav() {
  const { session, user, signOut, isLoading } = useSession();

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />; // Placeholder saat memuat
  }

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.email ? user.email[0].toUpperCase() : <User className="h-5 w-5" />}
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