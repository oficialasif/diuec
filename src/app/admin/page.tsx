'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { getPosts, getStatistics } from '@/lib/services'
import type { Post, Statistics } from '@/lib/models'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const { userProfile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [allPosts, statistics] = await Promise.all([
        getPosts(),
        getStatistics(),
      ])
      setPosts(allPosts)
      setStats(statistics)
      setLoading(false)
    }
    loadData()
  }, [])

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Active Users',
        data: [65, 78, 90, 120, 150, stats?.activeUsers || 0],
        borderColor: 'rgb(139, 92, 246)',
        tension: 0.3,
      },
    ],
  }

  if (!userProfile?.role === 'admin') {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-gray-400">
              Monitor and manage your community
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            <div className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-medium text-white">Total Users</h3>
              <p className="mt-2 text-4xl font-bold text-violet-400">
                {stats?.activeUsers || 0}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-medium text-white">Total Posts</h3>
              <p className="mt-2 text-4xl font-bold text-violet-400">
                {posts.length}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-medium text-white">Total Visitors</h3>
              <p className="mt-2 text-4xl font-bold text-violet-400">
                {stats?.totalVisitors || 0}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-medium text-white">Tournaments</h3>
              <p className="mt-2 text-4xl font-bold text-violet-400">
                {stats?.totalTournaments || 0}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 rounded-lg bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h2 className="text-xl font-semibold text-white">User Growth</h2>
            <div className="mt-4 h-[300px]">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
            {loading ? (
              <div className="mt-4 text-gray-400">Loading...</div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-lg ring-1 ring-white/10">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Caption
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Likes
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {posts.slice(0, 5).map((post) => (
                      <tr key={post.id} className="bg-white/5">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {post.userDisplayName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {post.caption.slice(0, 50)}...
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {post.likesCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {post.comments.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 