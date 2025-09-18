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

// Badge dan SparklesIcon tidak lagi diperlukan karena badge 'Latest component' dihapus
// import { Badge } from "@/components/ui/badge" 
// import { SparklesIcon } from "lucide-react"

interface CarouselProps {
  images: { src: string; alt: string }[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  title?: string;
  description?: string;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
  title = "Card Carousel", // Default title
  description = "Seamless Images carousel animation.", // Default description
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    /* Menghapus lebar tetap agar lebih responsif */
    height: 288px; /* Mengatur tinggi tetap untuk slide, setara dengan h-72 */
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%; /* Membuat gambar mengisi tinggi slide */
    object-fit: cover; /* Memastikan gambar menutupi area tanpa distorsi */
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  `
  return (
    <section className="w-full space-y-4"> {/* Mengubah w-ace-y-4 menjadi w-full space-y-4 */}
      <style>{css}</style>
      <div className="mx-auto w-full max-w-4xl rounded-[24px] border border-black/5 p-2 shadow-sm md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-black/5 bg-neutral-800/5 p-2 shadow-sm md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-2">
          {/* Badge 'Latest component' dihapus */}
          <div className="flex flex-col justify-center pb-2 pl-4 pt-4 md:items-start"> {/* Menyesuaikan padding-top */}
            <div className="flex gap-2">
              <div>
                <h3 className="text-2xl opacity-85 font-bold tracking-tight"> {/* Menyesuaikan ukuran teks */}
                  {title}
                </h3>
                <p className="text-muted-foreground">{description}</p> {/* Menambahkan text-muted-foreground */}
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
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
                    <div className="size-full rounded-3xl">
                      <Image
                        src={image.src}
                        width={500}
                        height={500}
                        className="size-full rounded-xl"
                        alt={image.alt}
                      />
                    </div>
                  </SwiperSlide>
                ))}
                {/* Menghapus duplikasi images.map */}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}