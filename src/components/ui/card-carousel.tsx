"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link" // Import Link
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
// Removed SparklesIcon import
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

// Removed Badge import

interface CarouselProps {
  images: { src: string; alt: string; link?: string }[] // Added link property
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px; /* Keep for pagination dots */
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 192px; /* Equivalent to h-48 */
    height: 192px; /* Equivalent to h-48 */
    display: flex; /* To center content if needed */
    justify-content: center;
    align-items: center;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%; /* Ensure image fills the slide */
    object-fit: cover; /* Ensure image covers the area without distortion */
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  /* Custom navigation button styling to make them visible and usable */
  .swiper-button-next, .swiper-button-prev {
    color: hsl(var(--primary)); /* Use primary color for visibility */
    background-color: hsl(var(--background)); /* Background for contrast */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.2s ease-in-out;
  }
  .swiper-button-next:hover, .swiper-button-prev:hover {
    background-color: hsl(var(--muted));
  }
  .swiper-button-next::after, .swiper-button-prev::after {
    font-size: 20px; /* Adjust icon size */
  }
  .swiper-button-prev {
    left: 0px; /* Adjust position */
  }
  .swiper-button-next {
    right: 0px; /* Adjust position */
  }
  `
  return (
    <section className="w-full">
      <style>{css}</style>
      <div className="relative w-full">
        <Swiper
          spaceBetween={10} // Reduced spaceBetween for tighter packing
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
          }}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          }}
          pagination={showPagination ? { clickable: true } : false}
          navigation={
            showNavigation
              ? {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }
              : undefined
          }
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Link href={image.link || "#"} target="_blank" rel="noopener noreferrer" className="block size-full rounded-xl overflow-hidden border">
                <Image
                  src={image.src}
                  width={192} // Match slide width
                  height={192} // Match slide height
                  className="size-full object-cover"
                  alt={image.alt}
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        {showNavigation && (
          <>
            <div className="swiper-button-prev absolute top-1/2 -translate-y-1/2 z-10 left-2" />
            <div className="swiper-button-next absolute top-1/2 -translate-y-1/2 z-10 right-2" />
          </>
        )}
      </div>
    </section>
  )
}