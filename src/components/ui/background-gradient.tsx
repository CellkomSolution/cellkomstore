"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Assuming cn utility is available

interface BackgroundGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  animate = true,
  ...props
}: BackgroundGradientProps) {
  return (
    <div className={cn("relative p-px overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-xl z-0 opacity-60 blur-xl",
          "bg-[radial-gradient(var(--gradient-start),var(--gradient-end))] dark:bg-[radial-gradient(var(--dark-gradient-start),var(--dark-gradient-end))]",
          animate && "animate-spin-slow", // Apply animation if animate is true
          "before:absolute before:inset-0 before:bg-[radial-gradient(var(--gradient-start),var(--gradient-end))] before:dark:bg-[radial-gradient(var(--dark-gradient-start),var(--dark-gradient-end))] before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-500"
        )}
      />
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
}