'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ProjectProvider } from '@/contexts/project-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ProjectProvider>{children}</ProjectProvider>
    </SessionProvider>
  )
}
