'use client'

import Home from '@/components/home/home'
import LatestUpdates from '@/components/home/LatestUpdates'

export default function HomePage() {
  return (
    <div className="bg-black">
      <Home />
      <LatestUpdates />
    </div>
  )
}
