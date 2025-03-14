'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Share2, Send } from "lucide-react"
import PhotoGallery from './PhotoGallery'
import { AuthModal } from "@/components/auth/auth"
import { useAuth } from '@/contexts/auth-context'

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

// Posts Data
const initialPosts = [
  {
    id: 1,
    title: "Valorant Tournament Finals",
    content: "The finals were intense with Team Phoenix taking the championship after a nail-biting overtime on Haven.",
    author: {
      name: "Admin",
      avatar: "/images/avatars/admin.png",
    },
    date: "2025-03-10T14:30:00",
    likes: 124,
    liked: false,
    comments: [
      {
        id: 1,
        user: {
          name: "GamerPro",
          avatar: "/images/avatars/user1.png",
        },
        text: "That overtime was insane! Best match I've seen all year.",
        date: "2025-03-10T15:45:00",
      },
    ],
    showComments: false,
    commentText: "",
    shares: 18,
  },
  {
    id: 2,
    title: "Free Fire Championship Registration Open",
    content: "Register your team for the upcoming Free Fire championship. Limited slots available!",
    author: {
      name: "Sarah Rahman",
      avatar: "/images/avatars/user2.png",
    },
    date: "2025-03-09T10:15:00",
    likes: 89,
    liked: false,
    comments: [
      {
        id: 1,
        user: {
          name: "FireFighter",
          avatar: "/images/avatars/user3.png",
        },
        text: "Can't wait to participate! When is the deadline?",
        date: "2025-03-09T11:30:00",
      },
    ],
    showComments: false,
    commentText: "",
    shares: 42,
  },
  {
    id: 3,
    title: "eFootball Workshop This Weekend",
    content: "Join us for an intensive eFootball workshop this weekend. Learn pro tips and strategies!",
    author: {
      name: "Coach Mike",
      avatar: "/images/avatars/user4.png",
    },
    date: "2025-03-08T09:20:00",
    likes: 156,
    liked: false,
    comments: [
      {
        id: 1,
        user: {
          name: "SoccerPro",
          avatar: "/images/avatars/user5.png",
        },
        text: "Will there be 1-on-1 coaching sessions?",
        date: "2025-03-08T10:15:00",
      },
    ],
    showComments: false,
    commentText: "",
    shares: 27,
  },
]

export default function Home() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [posts, setPosts] = useState(initialPosts)
  const [counts, setCounts] = useState({
    members: 0,
    tournaments: 0,
    teams: 0,
    games: 0,
  })

  // Animated counter for statistics
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

  // Post interaction functions
  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newLiked = !post.liked
          return {
            ...post,
            liked: newLiked,
            likes: newLiked ? post.likes + 1 : post.likes - 1,
          }
        }
        return post
      })
    )
  }

  const toggleComments = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            showComments: !post.showComments,
          }
        }
        return post
      })
    )
  }

  const updateCommentText = (postId: number, text: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentText: text,
          }
        }
        return post
      })
    )
  }

  const addComment = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId && post.commentText.trim()) {
          const newComment = {
            id: post.comments.length + 1,
            user: {
              name: "You",
              avatar: "/images/avatars/you.png",
            },
            text: post.commentText,
            date: new Date().toISOString(),
          }

          return {
            ...post,
            comments: [...post.comments, newComment],
            commentText: "",
          }
        }
        return post
      })
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleLogin = () => {
    // Handle successful login
    setShowAuthModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-violet-950/20 text-white">
      {/* Auth Modal */}
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

      {/* Latest Updates Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">LATEST UPDATES</h2>
          <div className="space-y-12">
            {posts.map((post) => (
              <div key={post.id} className="border-b border-gray-800 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(post.date)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-300">{post.content}</p>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    className={`flex items-center gap-2 ${post.liked ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition-colors`}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart className={`h-5 w-5 ${post.liked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span>{post.shares}</span>
                  </button>
                </div>

                {post.showComments && (
                  <div className="mt-6 space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{comment.user.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(comment.date)}</p>
                          </div>
                          <p className="text-sm text-gray-300">{comment.text}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3 mt-4">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src="/images/avatars/you.png"
                          alt="Your Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-gray-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Write a comment..."
                          value={post.commentText}
                          onChange={(e) => updateCommentText(post.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addComment(post.id)
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          className="rounded-full bg-purple-600 hover:bg-purple-700 h-8 w-8"
                          onClick={() => addComment(post.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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
