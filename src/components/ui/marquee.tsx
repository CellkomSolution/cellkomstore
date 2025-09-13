"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  children?: React.ReactNode;
}

export function Marquee({
  className,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  children,
  ...props
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.offsetWidth;

      // Duplicate content if it's smaller than the container to ensure continuous scroll
      if (contentWidth < containerWidth) {
        const duplicateCount = Math.ceil(containerWidth / contentWidth) + 1;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateCount; i++) {
          fragment.appendChild(contentRef.current.cloneNode(true));
        }
        contentRef.current.innerHTML = ''; // Clear original content
        contentRef.current.appendChild(fragment);
      }
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex overflow-hidden [--duration:30s] [--gap:1rem]",
        {
          "hover:[animation-play-state:paused]": pauseOnHover,
        },
        className
      )}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          "flex w-max animate-marquee items-center",
          {
            "animate-marquee--reverse": direction === "right",
            "animate-marquee--fast [--duration:20s]": speed === "fast",
            "animate-marquee--slow [--duration:40s]": speed === "slow",
          }
        )}
      >
        {children}
      </div>
    </div>
  );
}