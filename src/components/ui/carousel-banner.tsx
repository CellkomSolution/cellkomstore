"use client"

import {
  forwardRef,
  useEffect,
  useState,
} from "react"
import clsx from "clsx"
import {
  AnimatePresence,
  motion,
} from "framer-motion"
import Image from "next/image"

// --- Helper Functions and Fallbacks ---
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

const placeholderImage = (text = "Image") =>
  `https://placehold.co/1200x288/1a1a1a/ffffff?text=${text}` // Placeholder size for desktop

// --- Types ---
type StaticImageData = string;

interface CarouselBannerProps {
  images: StaticImageData[];
  alt: string;
  interval?: number; // Interval for auto-cycling in milliseconds
}

interface AnimatedImageProps {
  src: StaticImageData
  alt: string
  className?: string
  style?: React.CSSProperties
}

// --- Constants ---
const ANIMATION_PRESETS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.8, ease: "easeInOut" },
  },
} as const

type AnimationPreset = keyof typeof ANIMATION_PRESETS

// --- Hooks ---
function useImageCycler(totalImages: number, interval: number = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (totalImages === 0) return;

    const timerId = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, interval);

    return () => clearTimeout(timerId);
  }, [currentIndex, totalImages, interval]);

  return currentIndex;
}

// --- Components ---
const AnimatedImage = forwardRef<HTMLImageElement, AnimatedImageProps>(
  ({ src, alt, className, style, ...props }, ref) => {
    return (
      <Image
        ref={ref}
        alt={alt}
        className={className}
        src={src}
        fill
        priority // Mark as priority for LCP
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
        style={{ objectFit: "cover", position: "absolute", userSelect: "none", ...style }}
        onError={(e) => (e.currentTarget.src = placeholderImage(alt))}
        {...props}
      />
    )
  }
)
AnimatedImage.displayName = "AnimatedImage"

const MotionAnimatedImage = motion(AnimatedImage)

export function CarouselBanner({ images, alt, interval = 5000 }: CarouselBannerProps) {
  const currentImageIndex = useImageCycler(images.length, interval);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-48 md:h-72 rounded-lg border-2 border-dashed text-muted-foreground">
        Tidak ada gambar banner.
      </div>
    );
  }

  return (
    <div className="w-full h-48 md:h-72 relative rounded-lg overflow-hidden border"> {/* Adjusted height for mobile (h-48) and desktop (md:h-72) */}
      <AnimatePresence mode="wait">
        <MotionAnimatedImage
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt={alt}
          {...ANIMATION_PRESETS.fadeIn}
          className="w-full h-full" // Image fills the container
        />
      </AnimatePresence>
    </div>
  )
}