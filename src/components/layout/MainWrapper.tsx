'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // Admin and auth routes don't need navbar spacing
  const needsMargin = !pathname?.startsWith('/diuec') && !pathname?.startsWith('/auth')
  
  return (
    <main className={`flex-grow ${needsMargin ? 'mt-16' : ''}`}>
      {children}
    </main>
  )
}
