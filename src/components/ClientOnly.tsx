/**
 * @fileoverview Client-only wrapper component to prevent SSR hydration mismatches.
 *
 * Some components (like Recharts) don't render consistently between server and client.
 * This wrapper ensures the component only renders on the client side.
 *
 * @module components/ClientOnly
 */

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Client-only wrapper component.
 *
 * Only renders children after the component has mounted on the client.
 * This prevents SSR hydration mismatches for components that don't support SSR.
 *
 * @param children - Content to render only on client
 * @param fallback - Optional fallback to show during SSR (defaults to null)
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

