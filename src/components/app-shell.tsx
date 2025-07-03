'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return isLoginPage ? (
    <main className="flex items-center justify-center min-h-screen bg-background">
        {children}
    </main>
  ) : (
    <AppLayout>{children}</AppLayout>
  );
}
