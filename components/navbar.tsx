'use client'

import { useState, useEffect } from 'react'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useLocalTime } from '@/hooks/use-local-time'
import { useWeather } from '@/hooks/use-weather'
import { motion } from 'framer-motion'
import { Moon, Sun, Globe2, Mail, Menu, X } from 'lucide-react'

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
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [language, setLanguage] = useState<'en' | 'fr'>('en')

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

  const translations = {
    en: { home: 'Home', projects: 'Projects', skills: 'Skills', contact: 'Contact' },
    fr: { home: 'Accueil', projects: 'Projets', skills: 'Compétences', contact: 'Contact' },
  }

  return (
    <>
      {/* Top Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 px-4 py-2 text-xs text-white/60 border-b border-white/10 bg-neutral-950/50 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          {/* Location & Time */}
          <div className="flex items-center gap-4 min-w-0">
            {!geoLoading && city && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1"
              >
                <span className="truncate">{city}</span>
                <span className="opacity-50">•</span>
              </motion.div>
            )}
            <div className="flex items-center gap-1">
              <span>{time}</span>
              <span className="opacity-50">{timezone}</span>
            </div>
          </div>

          {/* Weather & Divider */}
          <div className="flex items-center gap-4 ml-auto">
            {!weatherLoading && temp !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1"
              >
                <span>{icon}</span>
                <span>{temp}°C</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Navbar */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-11 left-0 right-0 z-50 px-4 py-4 md:py-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 backdrop-blur-xl shadow-lg">
            {/* Glassmorphism effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative flex items-center justify-between px-4 py-3 sm:px-6">
              {/* Logo / Brand */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-lg font-bold text-white cursor-pointer"
                onClick={() => handleNavClick('main-content')}
              >
                Y
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
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

              {/* Utility Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Dark Mode Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.button>

                {/* Language Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white hidden sm:flex"
                  aria-label="Toggle language"
                >
                  <Globe2 className="w-4 h-4" />
                </motion.button>

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
        </div>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-32 md:h-28" />
    </>
  )
}
