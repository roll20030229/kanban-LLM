'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ProjectProvider } from '@/contexts/project-context'
import { ToastProvider } from '@/components/ui/toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ProjectProvider>
        <ToastProvider>{children}</ToastProvider>
      </ProjectProvider>
    </SessionProvider>
  )
}
