"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  imageUrl: string;
  title: string;
  description?: string | null;
  linkText?: string | null;
  linkUrl?: string | null;
  className?: string;
}

export function HeroBanner({
  imageUrl,
  title,
  description,
  linkText,
  linkUrl,
  className,
}: HeroBannerProps) {
  return (
    <div className={cn("relative w-full h-[250px] md:h-[350px] lg:h-[450px] rounded-lg overflow-hidden", className)}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-6 md:p-10">
        <div className="max-w-md text-white space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold leading-tight">{title}</h2>
          {description && (
            <p className="text-sm md:text-base hidden md:block">{description}</p>
          )}
          {linkText && linkUrl && (
            <Button asChild className="mt-4">
              <Link href={linkUrl}>{linkText}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}