"use client"

import { usePathname } from 'next/navigation'
import Navbar from './navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide navbar on auth pages and all dashboard/sidebar pages
  const hiddenPrefixes = ['/auth/', '/dashboard', '/chat', '/settings', '/history', '/profile', '/treatment', '/feedback', '/analytics', '/consult', '/dravya-id']
  const isHidden = pathname === '/signup' || hiddenPrefixes.some(prefix => pathname.startsWith(prefix))
  
  if (isHidden) {
    return null
  }
  
  return <Navbar />
}