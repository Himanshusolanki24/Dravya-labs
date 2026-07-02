'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  email?: string;
  firstName?: string;
  [key: string]: unknown;
}

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  const navLinks: { href: string; text: string }[] = [
  ];

  return (
    <nav className="bg-[var(--color-bg-primary)]/95 backdrop-blur-sm border-b border-[var(--color-bg-secondary)]/50 px-4 md:px-6 py-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Main Navigation Container */}
        <div className="grid grid-cols-3 items-center">

          {/* Left Side - Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.slice(0, 2).map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-green)] transition-all duration-300 font-medium relative group"
              >
                {link.text}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-accent-green)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Center - Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 md:w-14 md:h-14 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/Logo.png"
                  alt="Dravya Labs Logo"
                  width={56}
                  height={56}
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-[var(--color-accent-green)] text-xl font-bold tracking-wide">
                  Dravya Labs
                </span>
                <span className="text-[var(--color-text-secondary)] text-xs font-medium">
                  Digital Taste Innovation
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side - More Links & Auth */}
          <div className="flex items-center justify-end space-x-6">
            {/* Remaining Nav Links - Hidden on smaller screens */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.slice(2).map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-green)] transition-all duration-300 font-medium relative group"
                >
                  {link.text}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-accent-green)] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                // Logged in user options
                <div className="flex items-center space-x-4">
                  {/* User Profile */}
                  <div className="hidden md:flex items-center space-x-3 bg-[var(--color-bg-secondary)]/50 rounded-full px-4 py-2 border border-[var(--color-accent-green)]/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-accent-green)] to-[#45c068] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <span className="text-[var(--color-text-secondary)] font-medium text-sm">
                      {user?.firstName || 'User'}
                    </span>
                  </div>

                  {/* Dashboard Button */}
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-[var(--color-accent-green)] to-[#45c068] hover:from-[#45c068] hover:to-[var(--color-accent-green)] text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
                  >
                    Dashboard
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="border border-[var(--color-accent-green)]/50 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)] hover:text-[var(--color-accent-green)] px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 transform"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // Guest user options
                <div className="flex items-center space-x-3">
                  <Link
                    href="/signup"
                    className="border border-[var(--color-accent-green)]/50 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)] hover:text-[var(--color-accent-green)] px-5 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 transform hidden sm:block"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/auth/login"
                    className="bg-gradient-to-r from-[var(--color-accent-green)] to-[#45c068] hover:from-[#45c068] hover:to-[var(--color-accent-green)] text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-accent-green)] focus:outline-none transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm rounded-2xl border border-[var(--color-accent-green)]/20 p-6 space-y-4">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="block text-[var(--color-text-secondary)] hover:text-[var(--color-accent-green)] transition-colors duration-200 font-medium py-2 border-b border-[var(--color-bg-secondary)]/30 last:border-b-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="pt-4 space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full bg-gradient-to-r from-[var(--color-accent-green)] to-[#45c068] text-white px-6 py-3 rounded-full font-semibold text-center transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full border border-[var(--color-accent-green)] text-[var(--color-accent-green)] px-6 py-3 rounded-full font-medium text-center transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 space-y-3">
                <Link
                  href="/signup"
                  className="block w-full border border-[var(--color-accent-green)] text-[var(--color-accent-green)] px-6 py-3 rounded-full font-medium text-center transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full bg-gradient-to-r from-[var(--color-accent-green)] to-[#45c068] text-white px-6 py-3 rounded-full font-semibold text-center transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
