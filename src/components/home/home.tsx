'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { CommitteeMember, GalleryImage, Sponsor } from '@/lib/models'
import { AuthModal } from "@/components/auth/auth"
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

// Typewriter Effect Component
const TypewriterEffect = () => {
  const words = ["CHAMPIONS", "WINNERS", "LEGENDS", "WARRIORS", "HEROES"]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[currentWordIndex]
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setCurrentText((prev) => prev.substring(0, prev.length - 1))
          if (currentText === "") {
            setIsDeleting(false)
            setCurrentWordIndex((prev) => (prev + 1) % words.length)
          }
        } else {
          setCurrentText(word.substring(0, currentText.length + 1))
          if (currentText === word) {
            setTimeout(() => setIsDeleting(true), 2000)
            return
          }
        }
      },
      isDeleting ? 50 : 100
    )

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, words])

  return (
    <div className="inline-flex items-center min-h-[80px] md:min-h-[100px]">
      <div className="flex flex-col items-start gap-4">

        <motion.span
          className="text-violet-500 inline-block min-w-[300px] text-left text-6xl md:text-8xl font-extrabold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {currentText}
          <motion.span
            className="inline-block w-[4px] h-[60px] md:h-[80px] bg-violet-500 ml-2"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.span>
      </div>
    </div>
  )
}

// Helper type to handle serialized data from Server Components
type Serialized<T> = Omit<T, 'createdAt'> & { createdAt: string | number | Date }

interface HomeProps {
  committee: Serialized<CommitteeMember>[]
  gallery: Serialized<GalleryImage>[]
  sponsors: Serialized<Sponsor>[]
}

export default function Home({ committee, gallery, sponsors }: HomeProps) {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [counts, setCounts] = useState({
    members: 0,
    tournaments: 0,
    teams: 0,
    games: 0,
  })

  const [committeeHovered, setCommitteeHovered] = useState(false)
  const [sponsorsHovered, setSponsorsHovered] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => {
        const newCounts = { ...prev }
        if (newCounts.members < 5000) newCounts.members += 50
        if (newCounts.tournaments < 120) newCounts.tournaments += 1
        if (newCounts.teams < 350) newCounts.teams += 3
        if (newCounts.games < 25) newCounts.games += 1

        if (
          newCounts.members >= 5000 &&
          newCounts.tournaments >= 120 &&
          newCounts.teams >= 350 &&
          newCounts.games >= 25
        ) {
          clearInterval(interval)
        }

        return newCounts
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    setShowAuthModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-violet-950/20 text-white">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden pt-16">
        {/* Helper video background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay for better text visibility */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/hero video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-7xl mx-auto relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-bold text-violet-500 mb-4"
          >
            <span className="bg-violet-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              INTRODUCING
            </span>
          </motion.h1>
          <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-7xl md:text-7xl font-bold text-white">GAMING FOR</h1>
            <TypewriterEffect />
          </div>
        </div>
      </section>

      {/* Statistics Counter Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-purple-500">{counts.members.toLocaleString()}</p>
              <p className="text-gray-400 uppercase text-sm tracking-wider">Community Members</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-purple-500">{counts.tournaments}</p>
              <p className="text-gray-400 uppercase text-sm tracking-wider">Tournaments Hosted</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-purple-500">{counts.teams}</p>
              <p className="text-gray-400 uppercase text-sm tracking-wider">Active Teams</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-purple-500">{counts.games}</p>
              <p className="text-gray-400 uppercase text-sm tracking-wider">Games Supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* Committee Members Marquee Section */}
      <section className="py-16 bg-black border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">Committee Members 2026</h2>
          <p className="text-center text-gray-400">The team driving DIU Esports forward</p>
        </div>

        {committee.length > 0 ? (
          <div
            className="relative w-full overflow-hidden bg-black"
            onMouseEnter={() => setCommitteeHovered(true)}
            onMouseLeave={() => setCommitteeHovered(false)}
          >
            {/* Gradient Masks */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

            <motion.div
              className="flex w-max items-center"
              animate={committeeHovered ? {} : { x: "-50%" }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: Math.max(30, committee.length * 5), // Smoother, slower duration
              }}
            >
              {/* Render content twice for seamless loop */}
              {[...Array(2)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex shrink-0">
                  {/* Ensure enough items to fill screen by repeating fast */}
                  {Array.from({ length: Math.ceil(15 / committee.length) }).flatMap(() => committee).map((member, idx) => (
                    <div
                      key={`${groupIndex}-${member.id}-${idx}`}
                      className="w-64 flex-shrink-0 mx-4" // Use margin instead of gap for easier control
                    >
                      <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 backdrop-blur-sm flex flex-col items-center text-center group hover:bg-zinc-800 transition-colors">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-violet-500/20 group-hover:border-violet-500/80 transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]">
                          <Image src={member.image} alt={member.name} fill className="object-cover" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-1 truncate w-full">{member.name}</h3>
                        <p className="text-violet-400 text-sm truncate w-full font-medium">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">Loading committee members...</div>
        )}
      </section>

      {/* Dynamic Gallery Section - Pinterest Style */}
      <section className="py-16 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Moments</h2>
          <p className="text-gray-400">Captured memories from our events</p>
        </div>

        {gallery.length > 0 ? (
          <div className="container mx-auto px-4">
            <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="relative rounded-xl overflow-hidden group bg-zinc-900 break-inside-avoid mb-4"
                >
                  <div className="relative w-full">
                    <Image
                      src={img.imageUrl}
                      alt={img.title || 'Gallery Image'}
                      width={img.width || 600}
                      height={img.height || 400}
                      className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white font-medium">{img.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">No images in gallery yet.</div>
        )}
      </section>

      {/* Sponsors Section */}
      <section className="py-16 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Sponsors</h2>

          {sponsors.length > 0 ? (
            <div
              className="sponsor-scroll-container overflow-hidden relative"
              onMouseEnter={() => setSponsorsHovered(true)}
              onMouseLeave={() => setSponsorsHovered(false)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div className="flex w-full overflow-hidden">
                <motion.div
                  className="flex w-max items-center"
                  animate={sponsorsHovered ? {} : { x: "-50%" }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: Math.max(20, sponsors.length * 5),
                  }}
                >
                  {[...Array(2)].map((_, groupIndex) => (
                    <div key={groupIndex} className="flex shrink-0">
                      {Array.from({ length: Math.ceil(15 / sponsors.length) }).flatMap(() => sponsors).map((sponsor, idx) => (
                        <div key={`${groupIndex}-${sponsor.id}-${idx}`} className="relative w-32 h-20 flex-shrink-0 mx-12 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                          <Image src={sponsor.logo} alt={sponsor.name} fill className="object-contain" />
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Become a sponsor today!</div>
          )}
        </div>
      </section>
    </div>
  )
}
