"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react"
import clsx from "clsx"
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionStyle,
  type MotionValue,
  type Variants,
} from "framer-motion"
import Image from "next/image"

// --- Helper Functions and Fallbacks ---
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

const placeholderImage = (text = "Image") =>
  `https://placehold.co/1200x400/1a1a1a/ffffff?text=${text}`

// --- Types ---
type StaticImageData = string;

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>
  "--y": MotionValue<string>
}

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    }
    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])
  return isMobile
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

function BannerCard({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isMobile = useIsMobile()

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (isMobile) return
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      className="group relative w-full rounded-2xl"
      onMouseMove={handleMouseMove}
      style={{ "--x": useMotionTemplate`${mouseX}px`, "--y": useMotionTemplate`${mouseY}px` } as WrapperStyle}
    >
      <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900">
        {/* Adjusted height to be responsive with aspect-video, removed fixed min-height */}
        <div className="aspect-video w-full relative">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

export function CarouselBanner({ images, alt, interval = 5000 }: CarouselBannerProps) {
  const currentImageIndex = useImageCycler(images.length, interval);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed text-muted-foreground">
        Tidak ada gambar banner.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <BannerCard>
        <AnimatePresence mode="wait">
          <MotionAnimatedImage
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={alt}
            {...ANIMATION_PRESETS.fadeIn}
            className="w-full h-full"
          />
        </AnimatePresence>
      </BannerCard>
    </div>
  )
}