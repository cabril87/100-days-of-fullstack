import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import { SidebarProvider } from '@/lib/providers/SidebarContext';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { AppearanceProvider } from '@/lib/contexts/AppearanceContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { SpriteAnimationContainer } from '@/components/ui/SpriteAnimationContainer';
import { GlobalSearchModalWrapper } from '@/components/search/GlobalSearchTrigger';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
};

export const metadata: Metadata = {
  title: 'TaskTracker - Gamified Productivity',
  description: 'A gamified task tracking application with achievements, rewards, and family collaboration',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TaskTracker'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  },
  other: {
    "Content-Security-Policy": 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; " +
      "style-src 'self' 'unsafe-inline' data: https:; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data: https:; " +
      "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + " ws: wss:; " +
      "worker-src 'self' blob:; " +
      "child-src 'self' blob:; " +
      "media-src 'self' data: blob:;",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "TaskTracker",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-tap-highlight": "no"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppearanceProvider>
            <AuthProvider>
              <SidebarProvider>
                <ToastProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                  <SpriteAnimationContainer />
                  <GlobalSearchModalWrapper />
                </ToastProvider>
              </SidebarProvider>
            </AuthProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 