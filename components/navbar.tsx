'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useLocalTime } from '@/hooks/use-local-time'
import { useWeather } from '@/hooks/use-weather'
import { Menu, X, ArrowLeft, RefreshCw } from 'lucide-react'
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
  const isBlog = pathname?.startsWith('/blog')
  const isHome = pathname === '/'

  const navItems = isBlog ? [] : homeNavItems
  const defaultActive = navItems[0]?.id || ''

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(defaultActive)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

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

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

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
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Main Navbar - Centered */}
      <nav className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 px-2 sm:px-4 w-[calc(100%-1rem)] sm:w-auto max-w-[calc(100vw-1rem)]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 backdrop-blur-xl shadow-lg">
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-5 py-1.5">
            {/* Left: Brand with Time & Weather */}
            <div className="flex items-center gap-3">
              {!isHome ? (
                <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold text-white">YOUNES</span>
                </Link>
              ) : (
                <span className="text-sm font-bold text-white">YOUNES</span>
              )}
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-white/60">
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
                <span className="hidden sm:inline">{time}</span>
                {!weatherLoading && temp !== null && (
                  <span className="hidden md:inline-flex items-center gap-1.5">
                    <span className="opacity-30">•</span>
                    <span>{icon}</span>
                    <span>{temp}°C</span>
                  </span>
                )}
              </div>
            </div>

            {/* Center: Desktop Navigation or Reload */}
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
            ) : (
            <div ref={navContainerRef} className="hidden md:flex items-center gap-1 relative">
              {/* Sliding indicator */}
              <div
                className="absolute bottom-0 h-[2px] rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  opacity: indicator.width > 0 ? 1 : 0,
                }}
              />
              {navItems.map((item) => (
                <button
                  key={item.id}
                  ref={(el) => setNavItemRef(item.id, el)}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isBlog && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
            )}
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-white/10 px-4 py-3 space-y-1 md:hidden">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeSection === item.id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full bg-white" />
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          )}
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
