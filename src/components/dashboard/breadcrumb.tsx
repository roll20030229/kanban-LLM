'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumb() {
  const pathname = usePathname()
  
  const items = generateBreadcrumbItems(pathname)

  if (items.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-white/20" />
            )}
            
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 px-1.5 py-1 rounded-[6px] transition-all duration-200',
                isLast
                  ? 'text-white/90 font-medium bg-white/[0.06]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              )}
            >
              {index === 0 && <Home className="h-3.5 w-3.5" />}
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  
  if (paths.length === 0) return []

  const items: BreadcrumbItem[] = []
  let href = ''

  const labelMap: Record<string, string> = {
    '': '首页',
    'stats': '统计',
    'settings': '设置',
  }

  for (const path of paths) {
    href += `/${path}`
    const label = labelMap[path] || capitalizeFirstLetter(path)
    
    items.push({
      label,
      href,
    })
  }

  return items
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
