'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ProjectProvider } from '@/contexts/project-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ProjectProvider>{children}</ProjectProvider>
    </SessionProvider>
  )
}
