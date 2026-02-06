'use client'

import { useState, useEffect } from 'react'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useLocalTime } from '@/hooks/use-local-time'
import { useWeather } from '@/hooks/use-weather'
import { motion } from 'framer-motion'
import { Mail, Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  id: string
}

const navItems: NavItem[] = [
  { label: 'Home', id: 'main-content' },
  { label: 'Projects', id: 'projects-heading' },
  { label: 'Skills', id: 'skills-heading' },
  { label: 'Contact', id: 'contact-heading' },
]

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('main-content')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 backdrop-blur-xl shadow-lg">
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-center gap-8 px-6 py-3">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/0 via-white to-white/0"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden md:block h-4 w-px bg-white/20" />

            {/* Actions & Weather */}
            <div className="flex items-center gap-4">
              {/* Weather Display */}
              {!weatherLoading && temp !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 text-xs text-white/60"
                >
                  <span>{icon}</span>
                  <span>{temp}°C</span>
                </motion.div>
              )}

              {/* Contact Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = 'mailto:younes_sedki@hotmail.fr')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white hidden sm:flex"
                aria-label="Send email"
              >
                <Mail className="w-4 h-4" />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isMobileMenuOpen ? 1 : 0,
              height: isMobileMenuOpen ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden"
          >
            <div className="border-t border-white/10 px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}
