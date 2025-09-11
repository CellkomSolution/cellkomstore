"use client";

import * as React from "react";
import Image from "next/image";

interface FullWidthCarouselSlideProps {
  imageSrc: string;
  alt: string;
  priority?: boolean;
}

export function FullWidthCarouselSlide({
  imageSrc,
  alt,
  priority = false,
}: FullWidthCarouselSlideProps) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
        priority={priority}
      />
    </div>
  );
}