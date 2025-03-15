import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Predefined admin credentials - in production, these should be in environment variables
const ADMIN_EMAIL = 'admin@diuec.com'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if the email matches predefined admin email
      if (email !== ADMIN_EMAIL) {
        toast.error('Invalid admin credentials')
        setLoading(false)
        return
      }

      const { user, error } = await signIn(email, password)
      
      if (error) {
        toast.error(error)
        return
      }

      if (user) {
        toast.success('Welcome back, Admin!')
        router.push('/(protected)/admin')
      }
    } catch (error) {
      toast.error('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 p-8 bg-violet-950/50 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-gray-300">
            Access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
} 