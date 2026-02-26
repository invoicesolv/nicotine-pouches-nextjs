'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function DynamicLang() {
  const pathname = usePathname()

  useEffect(() => {
    // Set the correct language based on the route
    const isUSRoute = pathname.startsWith('/us')
    const correctLang = isUSRoute ? 'en-US' : 'en-GB'
    
    // Update the HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = correctLang
    }
  }, [pathname])

  return null
}
