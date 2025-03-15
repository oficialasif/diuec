'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { MessageSquare, Heart, Share2, Send } from "lucide-react"
import PhotoGallery from './PhotoGallery'
import { AuthModal } from "@/components/auth/auth"
import { useAuth } from '@/contexts/auth-context'
import LatestUpdates from './LatestUpdates'

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

// Sponsors Data
const sponsors = [
  { name: "Sponsor 1", logo: "/images/sponsors/logo-green.png" },
  { name: "Sponsor 2", logo: "/images/sponsors/logo-pink.png" },
  { name: "Sponsor 3", logo: "/images/sponsors/logo-green-splash.png" },
] as const

// Founders Data
const founders = [
  {
    name: "Founder",
    role: "CEO & Founder",
    image: "/images/founder/founder.jpg"
  },
  {
    name: "Co-Founder",
    role: "CTO & Co-Founder",
    image: "/images/founder/co founder.jpg"
  },
  {
    name: "Associate Co-Founder",
    role: "COO & Associate Co-Founder",
    image: "/images/founder/acofoinder.jpg"
  }
]

export default function Home() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [counts, setCounts] = useState({
    members: 0,
    tournaments: 0,
    teams: 0,
    games: 0,
  })

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
      <section className="relative h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-7xl mx-auto">
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

      <PhotoGallery />

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

      {/* Latest Updates */}
      <LatestUpdates />

      {/* Sponsors Section */}
      <section className="py-16 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Sponsors</h2>
          <div className="sponsor-scroll-container">
            <div className="sponsor-scroll-track">
              {[...Array(2)].map((_, groupIndex) => (
                <div key={`group-${groupIndex}`} className="flex gap-24">
                  {sponsors.map((sponsor, index) => (
                    <motion.div
                      key={`${sponsor.name}-${groupIndex}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="sponsor-logo"
                    >
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.name}
                        fill
                        className="object-contain p-2"
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Meet Our Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-violet-500">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-violet-200 mb-2">{founder.name}</h3>
                <p className="text-gray-400">{founder.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
