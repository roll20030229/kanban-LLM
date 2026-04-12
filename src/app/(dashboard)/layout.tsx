'use client'

import { Sidebar } from '@/components/dashboard'
import { CyberBackgroundEffect } from '@/components/ui/cyber-effects'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CyberBackgroundEffect>
      <Sidebar />
      <main className="md:ml-16 min-h-screen relative z-10 bg-transparent">
        {children}
      </main>
    </CyberBackgroundEffect>
  )
}
