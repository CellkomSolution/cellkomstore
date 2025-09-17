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
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// --- Helper Functions and Fallbacks ---
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

const placeholderImage = (text = "Image") =>
  `https://placehold.co/1200x288/1a1a1a/ffffff?text=${text}` // Placeholder size for desktop

// --- Types ---
type StaticImageData = string;

interface BannerContent {
  title: string | null;
  description: string | null;
  link_url: string | null;
}

interface CarouselBannerProps {
  images: StaticImageData[];
  alt: string;
  interval?: number; // Interval for auto-cycling in milliseconds
  bannerData?: BannerContent[]; // New prop for dynamic content
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

export function CarouselBanner({ images, alt, interval = 5000, bannerData = [] }: CarouselBannerProps) {
  const currentImageIndex = useImageCycler(images.length, interval);
  const currentBannerContent = bannerData[currentImageIndex];

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-48 md:h-72 rounded-lg border-2 border-dashed text-muted-foreground">
        Tidak ada gambar banner.
      </div>
    );
  }

  return (
    <div className="w-full h-48 md:h-72 relative rounded-lg overflow-hidden border">
      <AnimatePresence mode="wait">
        <MotionAnimatedImage
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt={alt}
          {...ANIMATION_PRESETS.fadeIn}
          className="w-full h-full"
        />
      </AnimatePresence>

      {currentBannerContent && (currentBannerContent.title || currentBannerContent.description || currentBannerContent.link_url) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-4 md:p-8 text-white">
          <div className="max-w-md space-y-2 md:space-y-4">
            {currentBannerContent.title && (
              <motion.h2
                key={currentImageIndex + "-title"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl md:text-4xl font-bold leading-tight"
              >
                {currentBannerContent.title}
              </motion.h2>
            )}
            {currentBannerContent.description && (
              <motion.p
                key={currentImageIndex + "-description"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-sm md:text-base line-clamp-3"
              >
                {currentBannerContent.description}
              </motion.p>
            )}
            {currentBannerContent.link_url && (
              <motion.div
                key={currentImageIndex + "-button"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button asChild className="mt-2 md:mt-4">
                  <Link href={currentBannerContent.link_url} target="_blank" rel="noopener noreferrer">
                    Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}