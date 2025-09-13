"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // in seconds
}

export function Marquee({ children, className, duration = 15 }: MarqueeProps) {
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ animationDuration: `${duration}s` }}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}