'use client';

import './globals.css';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import I18nProvider from '@/context/i18n-provider';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

// This is a wrapper to use the hook, since RootLayout itself is not inside the provider
function DynamicHtml({ children }: { children: React.ReactNode }) {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.lang = i18n.language;
        document.documentElement.dir = i18n.dir(i18n.language);
    }, [i18n, i18n.language]);

    return (
        <html lang={i18n.language} dir={i18n.dir(i18n.language)}>
            <head>
                <title>{t('app.title')}</title>
                <meta name="description" content={t('app.description')} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="font-body antialiased">
                {children}
            </body>
        </html>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <I18nProvider>
        <DynamicHtml>
            <AuthProvider>
                <AppShell>{children}</AppShell>
                <Toaster />
            </AuthProvider>
        </DynamicHtml>
    </I18nProvider>
  );
}