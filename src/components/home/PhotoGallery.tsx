'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const photos = [
  { id: 1, src: '/images/banners/banner1.jpg', height: 300 },
  { id: 2, src: '/images/banners/banner2.jpg', height: 400 },
  { id: 3, src: '/images/banners/banner3.jpg', height: 350 },
  { id: 4, src: '/images/banners/banner4.jpg', height: 280 },
  { id: 5, src: '/images/banners/banner5.jpg', height: 320 },
  { id: 6, src: '/images/banners/banner6.jpg', height: 380 },
  { id: 7, src: '/images/banners/banner7.jpg', height: 340 },
  { id: 8, src: '/images/banners/banner8.jpg', height: 360 },
]

export default function PhotoGallery() {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">PHOTO GALLERY</h2>
        <div className="md:columns-3 lg:columns-4 gap-4 hidden md:block">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mb-4 break-inside-avoid"
            >
              <div className="group relative overflow-hidden rounded-lg border-2 border-violet-500/50 hover:border-violet-500 transition-colors duration-300">
                <Image
                  src={photo.src}
                  alt={`Gallery photo ${photo.id}`}
                  width={400}
                  height={photo.height}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="text-white bg-violet-500 px-4 py-2 rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile Horizontal Scroll Gallery */}
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex space-x-4 pb-4 scrollbar-hide">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="snap-center flex-none w-[80vw] relative"
            >
              <div className="group relative overflow-hidden rounded-lg border-2 border-violet-500/50 hover:border-violet-500 transition-colors duration-300 h-[50vh]">
                <Image
                  src={photo.src}
                  alt={`Gallery photo ${photo.id}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="text-white bg-violet-500 px-4 py-2 rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}