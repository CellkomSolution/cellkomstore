"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

interface CarouselProps {
  images: { src: string; alt: string }[]
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
    padding-bottom: 50px; /* Space for pagination */
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 160px; /* w-40 for mobile */
    height: 192px; /* h-48 */
  }

  @media (min-width: 768px) { /* md breakpoint */
    .swiper-slide {
      width: 192px; /* w-48 for desktop */
      height: 192px; /* h-48 */
    }
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  `
  return (
    <div className="w-full"> {/* Simplified outer wrapper */}
      <style>{css}</style>
      <div className="flex w-full items-center justify-center">
        <div className="w-full">
          <Swiper
            spaceBetween={50}
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
            pagination={showPagination}
            navigation={
              showNavigation
                ? {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }
                : undefined
            }
            modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative size-full rounded-xl overflow-hidden"> {/* Added relative and overflow-hidden */}
                  <Image
                    src={image.src}
                    fill // Use fill to make image cover the parent div
                    style={{ objectFit: "cover" }} // Ensure image covers the area
                    className="rounded-xl"
                    alt={image.alt}
                    sizes="(max-width: 768px) 160px, 192px" // Responsive sizes for better performance
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}