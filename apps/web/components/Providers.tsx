'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { UniversalDialog } from '@/components/ui/UniversalDialog'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3, // 3 minutes fresh cache: instant page switching!
            gcTime: 1000 * 60 * 15, // 15 minutes in memory
            refetchOnWindowFocus: false, // Prevents spamming API on every tab switch
            refetchOnMount: false, // Uses cached data immediately if still fresh
            retry: 1, // Quick failover instead of hanging on retries
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <UniversalDialog />
      </AuthProvider>
    </QueryClientProvider>
  )
}
