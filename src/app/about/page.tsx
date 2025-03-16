'use client'

import { motion } from 'framer-motion'
import { Trophy, Users, Target, History, Medal, Award, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const achievements = [
  {
    title: 'National Champions',
    description: 'Won multiple national level tournaments',
    icon: Trophy,
    count: '5+'
  },
  {
    title: 'Active Members',
    description: 'Growing community of gamers',
    icon: Users,
    count: '1000+'
  },
  {
    title: 'Tournaments Organized',
    description: 'Successfully organized various gaming events',
    icon: Target,
    count: '20+'
  },
  {
    title: 'Years of Excellence',
    description: 'Leading esports community since 2020',
    icon: History,
    count: '3+'
  }
]

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
}

export default function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'team'))
        const teamData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[]
        setTeam(teamData)
      } catch (error) {
        console.error('Error fetching team:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              To create a thriving esports ecosystem that nurtures talent, promotes fair play,
              and builds lasting connections within the gaming community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="border border-gray-800 p-8 rounded-lg"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-400">
                To be the leading esports community in Bangladesh, recognized for our commitment
                to excellence, innovation, and the development of professional gamers.
              </p>
            </motion.div>

            <motion.div 
              className="border border-gray-800 p-8 rounded-lg"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4">Our Values</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-white" />
                  Excellence in everything we do
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-white" />
                  Community and collaboration
                </li>
                <li className="flex items-center">
                  <Medal className="w-5 h-5 mr-2 text-white" />
                  Fair play and sportsmanship
                </li>
                <li className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-white" />
                  Innovation and growth
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Achievements</h2>
            <p className="text-gray-400 text-lg">
              Milestones that define our journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div 
                key={achievement.title}
                className="border border-gray-800 p-6 rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <achievement.icon className="w-12 h-12 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-2">{achievement.count}</h3>
                <h4 className="text-xl font-semibold mb-2">{achievement.title}</h4>
                <p className="text-gray-400">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-400 text-lg">
              Meet the people behind our success
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div 
                  key={member.id}
                  className="border border-gray-800 rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative h-64">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-gray-400">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our History</h2>
            <p className="text-gray-400 text-lg">
              A journey of growth and excellence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="border border-gray-800 p-8 rounded-lg"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4">Our Journey</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center mr-4 flex-shrink-0">
                    2020
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Foundation</h4>
                    <p className="text-gray-400">
                      DIU Esports Community was established with a vision to create a platform
                      for gamers to showcase their talents.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center mr-4 flex-shrink-0">
                    2021
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">First National Victory</h4>
                    <p className="text-gray-400">
                      Our team won their first national level tournament, marking the beginning
                      of our competitive journey.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center mr-4 flex-shrink-0">
                    2022
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Expansion</h4>
                    <p className="text-gray-400">
                      We expanded our reach, organizing multiple tournaments and growing our
                      community significantly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center mr-4 flex-shrink-0">
                    2023
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">International Recognition</h4>
                    <p className="text-gray-400">
                      Our community gained international recognition and established partnerships
                      with global esports organizations.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="border border-gray-800 p-8 rounded-lg"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4">Future Goals</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-white" />
                  <span className="text-gray-400">Establish a professional esports training facility</span>
                </li>
                <li className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-white" />
                  <span className="text-gray-400">Win international tournaments</span>
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-white" />
                  <span className="text-gray-400">Grow our community to 5000+ members</span>
                </li>
                <li className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-white" />
                  <span className="text-gray-400">Launch our own esports academy</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
} 