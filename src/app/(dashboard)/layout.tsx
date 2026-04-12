'use client'

import { Sidebar } from '@/components/dashboard'
import { CyberBackgroundEffect } from '@/components/ui/cyber-effects'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  
  return (
    <main 
      className="min-h-screen relative z-10 bg-transparent pl-2 transition-all duration-500"
      style={{ 
        marginLeft: collapsed ? '52px' : '80px',
        transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)'
      }}
    >
      {children}
    </main>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <CyberBackgroundEffect>
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </CyberBackgroundEffect>
    </SidebarProvider>
  )
}
