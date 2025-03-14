'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Share2, Send, X } from "lucide-react"

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
  )
}

// Navigation Links
const navLinks = [
  { name: "COMMUNITY", href: "/community", current: false },
  { name: "TOURNAMENTS", href: "/tournaments", current: false },
  { name: "TEAMS", href: "/teams", current: false },
  { name: "ABOUT", href: "/about", current: false },
]

// Tournament Links
const tournamentLinks = [
  { name: "PUBG", href: "/tournaments/pubg", current: false },
  { name: "FREE FIRE", href: "/tournaments/free-fire", current: false },
  { name: "FOOTBALL", href: "/tournaments/football", current: false },
  { name: "VALORANT", href: "/tournaments/valorant", current: false },
  { name: "CS2", href: "/tournaments/cs2", current: false },
]

// Banner Data
const banners = [
  {
    id: 1,
    title: "E-FOOTBALL TOURNAMENT SEASON-3",
    date: "Coming soon...",
    status: "Diu eSports Community",
    image: "/images/posts/efootball.png",
    link: "/tournaments/football"
  }
]

// Sponsors Data
const sponsors = [
  { name: "Razer", logo: "/images/sponsors/razer.png" },
  { name: "Logitech", logo: "/images/sponsors/logitech.png" },
  { name: "SteelSeries", logo: "/images/sponsors/steelseries.png" },
  { name: "MSI", logo: "/images/sponsors/msi.png" },
  { name: "ASUS ROG", logo: "/images/sponsors/asus-rog.png" },
  { name: "HyperX", logo: "/images/sponsors/hyperx.png" },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          isSignUp,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsLoggedIn(true)
        setShowAuthModal(false)
        setEmail("")
        setPassword("")
        setUsername("")
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error("Authentication error:", error)
      // Here you would typically show an error message to the user
    }
  }

  const AuthModal = () => (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/95 p-8 rounded-xl border border-violet-500/20 w-full max-w-md relative"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            
            <form className="space-y-4" onSubmit={handleAuth}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-violet-500/20 text-white focus:outline-none focus:border-violet-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-violet-500/20 text-white focus:outline-none focus:border-violet-500"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-violet-500/20 text-white focus:outline-none focus:border-violet-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition-colors"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                className="text-violet-400 hover:text-violet-300 text-sm"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-violet-950/20 text-white">
      <AuthModal />
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-violet-500/20">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent">DIU ESPORTS</h1>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <Link 
                    href={link.name === "TOURNAMENTS" ? "/tournaments" : `/${link.name.toLowerCase()}`}
                    className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                  {link.name === "TOURNAMENTS" && (
                    <div className="absolute left-0 mt-2 w-48 bg-black/95 rounded-md shadow-lg overflow-hidden z-20 transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-top border border-violet-500/20">
                      <div className="py-2">
                        {tournamentLinks.map((tournament) => (
                          <Link
                            key={tournament.name}
                            href={tournament.href}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-violet-600 hover:text-white transition-colors"
                          >
                            {tournament.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors">
                    DASHBOARD
                  </Link>
                  <Link href="/chat" className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors">
                    CHAT
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="rounded-full border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all duration-300"
                  onClick={() => setIsLoggedIn(false)}
                >
                  SIGN OUT
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-full border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all duration-300"
                  onClick={() => setShowAuthModal(true)}
                >
                  SIGN IN
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-16 bg-transparent">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-violet-800 to-violet-600 text-xs font-medium mb-6">
              INTRODUCING DIU ESPORTS
            </div>
            <h2 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tighter mb-8">
              GAMING FOR
              <br />
              <TypewriterEffect />
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
            >
              Join the largest university gaming community. Compete in tournaments,
              connect with fellow gamers, and rise to glory.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Banner Carousel Section */}
      <section className="py-16 bg-black overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full max-w-[1128px] mx-auto overflow-hidden rounded-lg border border-violet-500/20"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />

            {/* Banners */}
            {banners.map((banner) => (
              <motion.div
                key={banner.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            ))}

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-center p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm mb-4">
                  {banners[0].date}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  {banners[0].title}
                </h2>
                <p className="text-xl text-gray-300 mb-8">{banners[0].status}</p>
                <Link href={banners[0].link}>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
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

      {/* Posts Section */}
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
      <section className="py-20 bg-black overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">OUR SPONSORS</h2>
          <div className="relative">
            <div className="sponsor-scroll-container">
              <div className="sponsor-scroll-track flex animate-scroll">
                {[...sponsors, ...sponsors].map((sponsor, i) => (
                  <div key={i} className="mx-8 flex-shrink-0">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={120}
                      height={60}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
