import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/providers/AuthContext';
import { TaskProvider } from "@/lib/providers/TaskProvider";
import { ToastProvider } from "@/lib/providers/ToastProvider";
import { FocusProvider } from "@/lib/providers/FocusContext";
import { GamificationProvider } from "@/lib/providers/GamificationProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { FamilyProvider } from '@/lib/providers/FamilyContext';
import { TemplateProvider } from '@/lib/providers/TemplateProvider';
import { PWAProvider } from '@/lib/providers/PWAProvider';
import { SidebarProvider } from '@/lib/providers/SidebarContext';
import { AppLayout } from '@/components/layout/AppLayout';
import FetchInterceptor from '@/components/FetchInterceptor';
import DeletionOverlay from '@/components/DeletionOverlay';
import SignalRManager from '@/components/SignalRManager';
import RealTimeNotificationWidget from '@/components/notifications/RealTimeNotificationWidget';

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
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' " +
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"),
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
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
              <TaskProvider>
                <ToastProvider>
                  <FocusProvider>
                    <FamilyProvider>
                      <TemplateProvider>
                        <PWAProvider>
                        <GamificationProvider>
                          <FetchInterceptor />
                          <DeletionOverlay />
                          <SignalRManager />
                          <RealTimeNotificationWidget />
                          <AppLayout>
                            {children}
                          </AppLayout>
                        </GamificationProvider>
                        </PWAProvider>
                      </TemplateProvider>
                    </FamilyProvider>
                  </FocusProvider>
                </ToastProvider>
              </TaskProvider>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 