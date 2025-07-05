'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { getPermission, PERMISSIONS } from '@/lib/permissions';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Gavel,
  Building,
  Users,
  Settings,
  Shield,
  LogOut,
  LifeBuoy,
  Database,
} from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';

const allNavItems = [
  { href: '/', labelKey: 'nav.dashboard', icon: Home, feature: PERMISSIONS.DASHBOARD },
  { href: '/violations', labelKey: 'nav.violations', icon: FileText, feature: PERMISSIONS.VIOLATIONS },
  { href: '/objections', labelKey: 'nav.objections', icon: Gavel, feature: PERMISSIONS.OBJECTIONS },
  { href: '/branches', labelKey: 'nav.branches', icon: Building, feature: PERMISSIONS.BRANCHES },
  { href: '/settings/users', labelKey: 'nav.users', icon: Users, feature: PERMISSIONS.USERS },
  { href: '/settings/management', labelKey: 'nav.dataManagement', icon: Database, feature: PERMISSIONS.MANAGEMENT },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authUser, user, loading } = useAuth();
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // When no longer loading, if there's no authenticated user, redirect to login
    if (!loading && !authUser) {
      router.push('/login');
    }
  }, [authUser, loading, router]);
  
  const navItems = useMemo(() => {
      if (!user) return [];
      return allNavItems.filter(item => getPermission(user.role, item.feature) !== 'none');
  }, [user]);


  // While loading auth state or user profile, show a full-screen loader
  if (loading || !authUser || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Shield className="h-12 w-12 text-primary animate-pulse" />
          {isClient && (
            <>
              <h1 className="text-xl font-semibold">{t('auth.verifying')}</h1>
              <p className="text-muted-foreground">{t('auth.pleaseWait')}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar
        side="left"
        className="border-r"
        collapsible="icon"
      >
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="shrink-0 text-primary" asChild>
                <Link href="/"><Shield className="size-6" /></Link>
             </Button>
            <h1 className="text-xl font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
              {t('app.title')}
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                  tooltip={{
                    children: t(item.labelKey),
                    side: 'right',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <div className="flex flex-1 justify-end">
              <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <UserMenu />
              </div>
            </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserMenu() {
  const { authUser, user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Avatar>
            <AvatarImage
              src={authUser?.photoURL ?? "https://placehold.co/32x32.png"}
              alt={t('common.userAvatar')}
              data-ai-hint="user avatar"
            />
            <AvatarFallback>{user?.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user?.name ?? authUser?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
          <span>{t('nav.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <LifeBuoy className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
          <span>{t('nav.support')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
          <span>{t('nav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
