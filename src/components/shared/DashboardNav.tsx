'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  ClipboardList, LogOut, ChevronDown,
  LayoutDashboard, User, Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface Props {
  userName: string
  userEmail: string
}

export function DashboardNav({ userName, userEmail }: Props) {
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  const isBuilder = pathname.includes('/edit')
  const isResponses = pathname.includes('/responses')
  const isTemplates = pathname.startsWith('/templates')

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  const displayName = userName || userEmail

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm hidden sm:block">Accord</span>
          </Link>
          {(isBuilder || isResponses || isTemplates) && (
            <>
              <span className="text-muted-foreground/30 text-lg select-none">/</span>
              <span className="text-sm text-muted-foreground">
                {isBuilder ? 'Builder' : isResponses ? 'Responses' : 'Templates'}
              </span>
            </>
          )}
        </div>

        {/* Nav links + user menu */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              My Forms
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/templates">
              <Globe className="w-4 h-4 mr-1.5" />
              Templates
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 max-w-[200px] ml-1">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-sm">{displayName}</span>
                <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  {userName && <span className="text-sm font-medium truncate">{userName}</span>}
                  <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 mr-2" />My Forms
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/templates" className="cursor-pointer">
                  <Globe className="w-4 h-4 mr-2" />Community Templates
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
