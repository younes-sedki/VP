'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useLocalTime } from '@/hooks/use-local-time'
import { useWeather } from '@/hooks/use-weather'
import { ArrowLeft, RefreshCw, Home, ChevronRight, ChevronLeft } from 'lucide-react'
import { SHOW_SECTIONS } from '@/lib/sections-config'
import ProfileModal from '@/components/profile-modal'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItem {
  label: string
  id: string
  sectionKey?: keyof typeof SHOW_SECTIONS
}

// Home page nav items (no "Home" since we're already there)
const homeNavItems: NavItem[] = [
  { label: 'Projects', id: 'projects-heading', sectionKey: 'projects' },
  { label: 'Skills', id: 'skills-heading', sectionKey: 'skills' },
  { label: 'Newsletter', id: 'newsletter-heading' },
  { label: 'Contact', id: 'contact-heading', sectionKey: 'contact' },
].filter((item) => !item.sectionKey || SHOW_SECTIONS[item.sectionKey as keyof typeof SHOW_SECTIONS])

export default function Navbar() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/npe')
  const isBlog = pathname?.startsWith('/blog')
  const isHome = pathname === '/'

  const isOtherPage = !isHome && !isBlog && !isAdmin

  const navItems = isBlog ? [] : homeNavItems
  const defaultActive = navItems[0]?.id || ''

  const [activeSection, setActiveSection] = useState(defaultActive)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [navExpanded, setNavExpanded] = useState(false)

  // Refs for the sliding indicator
  const navContainerRef = useRef<HTMLDivElement>(null)
  const navItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const setNavItemRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      navItemRefs.current.set(id, el)
    } else {
      navItemRefs.current.delete(id)
    }
  }, [])

  // Update indicator position when active section changes
  useEffect(() => {
    const activeEl = navItemRefs.current.get(activeSection)
    const container = navContainerRef.current
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect()
      const elRect = activeEl.getBoundingClientRect()
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      })
    }
  }, [activeSection])

  const { coords, loading: geoLoading } = useGeolocation()
  const { time, timezone } = useLocalTime()
  const { temp, icon, city, loading: weatherLoading } = useWeather(
    coords?.latitude || null,
    coords?.longitude || null
  )

  const navCollapsed = !navExpanded

  // Track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )

    navItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(id)
    }
  }

  // Hide navbar on admin pages
  if (isAdmin) return null

  return (
    <>
      {/* Main Navbar - Centered */}
      <nav
        className="fixed top-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 backdrop-blur-xl shadow-lg w-auto max-w-[calc(100vw-2rem)] pointer-events-auto">
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-1.5 transition-all duration-300">
            {/* Left: Brand + Avatar + Clock */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {!isHome ? (
                <Link href="/" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm font-bold text-white">YOUNES</span>
                </Link>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-white">YOUNES</span>
              )}
              <div className="h-3 w-px bg-white/20 flex-shrink-0" />
              <div className="flex items-center gap-1.5 text-white/60 flex-shrink-0">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-white/40 transition-all flex-shrink-0 cursor-pointer"
                  aria-label="View profile"
                >
                  <Image
                    src="/apple-touch-icon.png"
                    alt="Profile"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                </button>
                <span className="text-[10px] sm:text-xs tabular-nums">{time}</span>
                {!weatherLoading && temp !== null && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs">
                    <span className="opacity-30">•</span>
                    <span>{icon}</span>
                    <span>{temp}°C</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: Navigation items — animate hide/show on mobile scroll */}
            {isBlog ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setIsReloading(true)
                      window.dispatchEvent(new CustomEvent('reload-tweets'))
                      setTimeout(() => setIsReloading(false), 1000)
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                    aria-label="Reload tweets"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isReloading ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-neutral-800 text-white border border-white/10 text-xs">
                  Reload for new tweets
                </TooltipContent>
              </Tooltip>
            ) : isOtherPage ? (
              <>
                <div className="h-3 w-px bg-white/20 flex-shrink-0" />
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-white hover:text-white/70 transition-colors whitespace-nowrap"
                >
                  <Home className="w-3 h-3" />
                  Go Home
                </Link>
              </>
            ) : (
              <>
                {/* Desktop: always show divider + nav */}
                <div className="hidden sm:block h-3 w-px bg-white/20" />
                <div
                  ref={navContainerRef}
                  className="hidden sm:flex items-center gap-1 relative"
                >
                  <div
                    className="absolute bottom-0 h-[2px] rounded-full bg-white transition-all duration-300"
                    style={{ left: indicator.left, width: indicator.width, opacity: indicator.width > 0 ? 1 : 0 }}
                  />
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      ref={(el) => setNavItemRef(item.id, el)}
                      onClick={() => handleNavClick(item.id)}
                      className={`relative px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        activeSection === item.id ? 'text-white' : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Mobile: toggle button + conditional nav */}
                <button
                  onClick={() => setNavExpanded(!navExpanded)}
                  className="sm:hidden p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                  aria-label={navCollapsed ? 'Show navigation' : 'Hide navigation'}
                >
                  {navCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
                
                {/* Mobile nav items - only when expanded */}
                {!navCollapsed && (
                  <>
                    <div className="sm:hidden h-3 w-px bg-white/20" />
                    <div className="sm:hidden flex items-center gap-0.5">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`px-2 py-1.5 text-[10px] font-medium whitespace-nowrap ${
                            activeSection === item.id ? 'text-white' : 'text-white/50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-12" />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  )
}
