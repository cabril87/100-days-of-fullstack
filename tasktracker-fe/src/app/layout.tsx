import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/providers/AuthContext';
import { TaskProvider } from "@/lib/providers/TaskProvider";
import { ToastProvider } from "@/lib/providers/ToastProvider";
import { FocusProvider } from "@/lib/providers/FocusContext";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { FamilyProvider } from '@/lib/providers/FamilyContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Tracker',
  description: 'A comprehensive task management application',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  other: {
    "Content-Security-Policy": 
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' " +
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
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
          <TaskProvider>
            <ToastProvider>
                <FocusProvider>
                  <FamilyProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-6">
                {children}
              </main>
                  </FamilyProvider>
                </FocusProvider>
            </ToastProvider>
          </TaskProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
