'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        expand={false}
        visibleToasts={3}
        toastOptions={{
          style: {
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: 'var(--r)',
            fontSize: '13px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
