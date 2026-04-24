"use client"

import { usePathname } from 'next/navigation'
import Navbar from './navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide navbar on login, signup, and dashboard pages
  if (pathname === '/auth/login' || pathname === '/auth/signup' || pathname === '/dashboard') {
    return null
  }
  
  return <Navbar />
}