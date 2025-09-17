"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface ImageCarouselItem {
  src: string;
  alt: string;
  link: string;
}

interface ImageColumnProps {
  images: ImageCarouselItem[];
  index: number;
  currentTime: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const distributeImages = (allImages: ImageCarouselItem[], columnCount: number): ImageCarouselItem[][] => {
  const shuffled = shuffleArray(allImages);
  const columns: ImageCarouselItem[][] = Array.from({ length: columnCount }, () => []);

  shuffled.forEach((image, index) => {
    columns[index % columnCount].push(image);
  });

  const maxLength = Math.max(...columns.map((col) => col.length));
  columns.forEach((col) => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)]);
    }
  });

  return columns;
};

const ImageColumn: React.FC<ImageColumnProps> = React.memo(
  ({ images, index, currentTime }) => {
    const cycleInterval = 2000;
    const columnDelay = index * 200;
    const adjustedTime = (currentTime + columnDelay) % (cycleInterval * images.length);
    const currentIndex = Math.floor(adjustedTime / cycleInterval);
    const currentImage = images[currentIndex];

    return (
      <motion.div
        className="relative h-20 w-32 overflow-hidden md:h-28 md:w-56" // Diperbesar
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentImage.src}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: {
                type: "tween",
                ease: "easeIn",
                duration: 0.3,
              },
            }}
          >
            <Link href={currentImage.link} target="_blank" rel="noopener noreferrer">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={160} // Sesuaikan ukuran sesuai kebutuhan
                height={160} // Sesuaikan ukuran sesuai kebutuhan
                className="h-24 w-24 max-h-[80%] max-w-[80%] object-contain md:h-40 md:w-40" // Diperbesar
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }
);

interface ImageCarouselProps {
  columnCount?: number;
  images: ImageCarouselItem[];
}

export function ImageCarousel({ columnCount = 2, images }: ImageCarouselProps) {
  const [imageSets, setImageSets] = useState<ImageCarouselItem[][]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(updateTime, 100);
    return () => clearInterval(intervalId);
  }, [updateTime]);

  useEffect(() => {
    const distributedImages = distributeImages(images, columnCount);
    setImageSets(distributedImages);
  }, [images, columnCount]);

  return (
    <div className="flex justify-center space-x-4">
      {imageSets.map((images, index) => (
        <ImageColumn
          key={index}
          images={images}
          index={index}
          currentTime={currentTime}
        />
      ))}
    </div>
  );
}