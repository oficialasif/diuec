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
    title: 'Tournaments Hosted',
    description: 'Major events across PUBG, Valorant, and more',
    icon: Trophy,
    count: '120+'
  },
  {
    title: 'Community Members',
    description: 'The largest student gaming network in BD',
    icon: Users,
    count: '5,000+'
  },
  {
    title: 'Active Teams',
    description: 'Supported squads across 25+ game titles',
    icon: Target,
    count: '350+'
  },
  {
    title: 'Years of Legacy',
    description: 'Defining university esports since 2020',
    icon: History,
    count: '4+'
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
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-violet-900/10 -z-10" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Our Mission</h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              To define the future of collegiate esports in Bangladesh. We provide a professional platform for
              Daffodil International University students to compete, collaborate, and build careers in the
              gaming industry. More than just tournaments, we are a family of 5,000+ gamers united by passion.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:border-violet-500/50 transition-colors"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Target className="text-red-500" /> Our Vision
              </h3>
              <p className="text-gray-400 leading-relaxed">
                To establish DIU as the premier hub for esports talent in South Asia. We envision a campus where
                gaming is celebrated alongside traditional sports, producing athletes who represent Bangladesh
                on the global stage.
              </p>
            </motion.div>

            <motion.div
              className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:border-violet-500/50 transition-colors"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Star className="text-yellow-500" /> Core Values
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" /> Excellence
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" /> Integrity
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" /> Inclusivity
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" /> Innovation
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 px-4 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Impact</h2>
            <p className="text-gray-400 text-lg">
              Numbers that tell our story
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                className="bg-black border border-zinc-800 p-6 rounded-xl text-center group hover:-translate-y-2 transition-transform duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-violet-500/10 rounded-full flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                  <achievement.icon className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-4xl font-bold mb-2 text-white">{achievement.count}</h3>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">{achievement.title}</h4>
                <p className="text-sm text-gray-400">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Leadership</h2>
            <p className="text-gray-400 text-lg">
              The students driving the revolution
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative h-72">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4 pt-12">
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <p className="text-violet-400 text-sm font-medium">{member.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* History Section - Updated */}
      <section className="py-20 px-4 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Legacy</h2>
            <p className="text-gray-400 text-lg">
              From a small club to a national powerhouse
            </p>
          </motion.div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {[
              { year: '2020', title: 'The Beginning', desc: 'Founded by a group of passionate students during the global lockdown, DIUEC started as a way to connect students through Discord and mobile gaming.' },
              { year: '2021', title: 'First Steps', desc: 'Hosted our first inter-department PUBG Mobile tournament with over 50 teams participating, establishing our presence on campus.' },
              { year: '2022', title: 'Rapid Growth', desc: 'Expanded to PC titles like Valorant and CS:GO. Partnered with national brands for sponsorship and launched the official "DIU Cup".' },
              { year: '2023', title: 'National Stage', desc: 'Our representative teams placed Top 3 in multiple national inter-university championships. Community membership crossed 3,000 students.' },
              { year: '2024', title: 'The Ultimate Hub', desc: 'Launched this platform to automate tournaments and team management, solidifying DIU EC as the most technologically advanced student gaming body in Bangladesh.' }
            ].map((item, i) => (
              <div key={item.year} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-violet-500 bg-black flex items-center justify-center font-bold text-violet-400 z-10 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                    {item.year}
                  </div>
                  {i !== 4 && <div className="w-0.5 h-full bg-zinc-800 -my-2 group-hover:bg-violet-900/50" />}
                </div>
                <div className="pb-12 pt-2">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 