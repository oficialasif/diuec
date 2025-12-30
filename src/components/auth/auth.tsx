'use client'

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Eye, EyeOff, Mail, Lock, User, ArrowRight, Facebook } from "lucide-react"
import { auth, db } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { FirebaseError } from 'firebase/app'

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
}: {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = originalStyle
    }
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isOpen])

  // Reset form when switching between login and signup
  useEffect(() => {
    setEmail("")
    setPassword("")
    setUsername("")
    setConfirmPassword("")
    setFormError("")
  }, [isSignUp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Basic validation
    if (isSignUp) {
      if (password !== confirmPassword) {
        setFormError("Passwords do not match")
        return
      }

      if (password.length < 6) {
        setFormError("Password must be at least 6 characters")
        return
      }
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update user profile
        await updateProfile(user, {
          displayName: username || email.split('@')[0],
        })

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: username || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          bio: '',
          role: 'user',
          level: 1,
          followers: [],
          following: [],
          achievements: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        toast.success('Account created successfully!')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('Signed in successfully!')
      }
      onLogin()
      onClose()
    } catch (error) {
      console.error('Auth error:', error)
      const errorMessage = error instanceof FirebaseError ? error.message : 'Authentication failed'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    try {
      const authProvider = provider === 'google' 
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider()
      
      const result = await signInWithPopup(auth, authProvider)
      const user = result.user

      // Create user document in Firestore if it doesn't exist or update if it does
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio: '',
        role: 'user',
        level: 1,
        followers: [],
        following: [],
        achievements: [],
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { 
        merge: true // This will only update fields that are provided and keep existing data
      })

      toast.success('Signed in successfully!')
      onLogin()
      onClose()
    } catch (error) {
      console.error('Social auth error:', error)
      const errorMessage = error instanceof FirebaseError ? error.message : 'Social authentication failed'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-300"
        style={{ maxHeight: "95vh" }}
      >
        {/* Animated background elements */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-gray-800/80 p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Container with sliding animation - Fix the width and transform */}
        <div
          className="flex w-[200%] transition-transform duration-500 ease-in-out"
          style={{ transform: isSignUp ? "translateX(-50%)" : "translateX(0)" }}
        >
          {/* Login Form */}
          <div className="w-1/2 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
            <div className="mb-6 text-center mt-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your gaming journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="h-12 w-full rounded-lg bg-gray-800/70 border border-gray-700 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-12 w-full rounded-lg bg-gray-800/70 border border-gray-700 pl-10 pr-12 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors duration-200"
                >
                  Google
                </button>
              </div>

              {formError && <div className="rounded-md bg-red-900/30 p-3 text-sm text-red-400">{formError}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? "Loading..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Facebook className="mr-2 h-5 w-5 text-blue-500" />
                  Facebook
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-200"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="w-1/2 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
            <div className="mb-6 text-center mt-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Join the DIU Esports community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username"
                  className="h-12 w-full rounded-lg bg-gray-800/70 border border-gray-700 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="h-12 w-full rounded-lg bg-gray-800/70 border border-gray-700 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-12 w-full rounded-lg bg-gray-800/70 border border-gray-700 pl-10 pr-12 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="h-12 w-full rounded-lg bg-gray-800/70 border border-gray-700 pl-10 pr-12 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-200"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {formError && <div className="rounded-md bg-red-900/30 p-3 text-sm text-red-400">{formError}</div>}

              <button
                type="submit"
                className="relative flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 text-white font-medium shadow-lg shadow-purple-700/30 hover:from-purple-600 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Fix the "Or sign up with" section to ensure it's visible */}
            <div className="mt-8 pb-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-900 px-2 text-gray-400">Or sign up with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Facebook className="mr-2 h-5 w-5 text-blue-500" />
                  Facebook
                </button>
              </div>
            </div>

            <div className="mt-6 text-center pb-4">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-200"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Animated slider indicator - Move it up slightly to ensure visibility */}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-2 z-10">
          <button
            onClick={() => setIsSignUp(false)}
            className={`h-2 w-10 rounded-full transition-all duration-300 ${
              !isSignUp ? "bg-purple-600 w-10" : "bg-gray-700 w-6"
            }`}
            aria-label="Go to sign in"
          />
          <button
            onClick={() => setIsSignUp(true)}
            className={`h-2 w-10 rounded-full transition-all duration-300 ${
              isSignUp ? "bg-purple-600 w-10" : "bg-gray-700 w-6"
            }`}
            aria-label="Go to sign up"
          />
        </div>
      </div>
    </div>
  )
}

